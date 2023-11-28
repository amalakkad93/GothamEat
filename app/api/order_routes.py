from flask import Blueprint, jsonify, request, abort, current_app
from flask_login import login_required, current_user
from icecream import ic
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
from datetime import datetime
from http import HTTPStatus
from uuid import uuid4
from app.models import db, Order, OrderItem, MenuItem, ShoppingCart, ShoppingCartItem, Payment, Delivery
from app.forms import OrderForm, OrderItemForm
from ..helper_functions import normalize_data, is_authorized_to_access_order, get_payment_gateway_enum
from ..helper_functions.payment_gateway import PaymentGateway
import traceback
import logging
import datetime

# Blueprint for routes related to Orders
order_routes = Blueprint('orders', __name__)
# Set up logging

def validate_order_status(status):
    """
    Validates the provided status against allowed values.

    Args:
        status (str): The status to validate.

    Raises:
        ValueError: If the status is not allowed.
    """
    allowed_statuses = ['Pending', 'Completed', 'Cancelled', 'Processing']
    if status not in allowed_statuses and status.lower() != 'cancel':
        raise ValueError(f"Invalid status: {status}. Allowed statuses are: {', '.join(allowed_statuses)}.")


def error_response(message, status_code):
    """
    Create a standardized error response.

    Args:
        message (str): The error message.
        status_code (int): The HTTP status code.

    Returns:
        Response: A JSON error response with the given message and status code.
    """
    response = jsonify({"error": message})
    response.status_code = status_code
    return response



# ***************************************************************
# Endpoint to Get User Orders
# ***************************************************************
@login_required
@order_routes.route('/user/<int:user_id>')
def get_user_orders(user_id):
    """
    Retrieve all orders associated with the currently authenticated user.

    Returns:
        Response: A JSON representation of the user's orders or an error message.
    """
    try:
        if current_user.id != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        # Fetch orders associated with the current user
        orders = Order.query.filter_by(user_id=current_user.id).all()

        if not orders:
            return jsonify({
                "message": "No orders found for the user.",
                "entities": {
                    "orders": {
                        "byId": {},
                        "allIds": []
                    }
                }
            }), 404

        # Normalize the order data for frontend consumption
        normalized_orders = normalize_data([order.to_dict() for order in orders], 'id')

        return jsonify({
            "entities": {
                "orders": normalized_orders
            }
        })

    except Exception as e:
        # In case of unexpected errors, return a generic error message
        return jsonify({"error": "An unexpected error occurred while fetching the orders."}), 500

# ***************************************************************
# Endpoint to Create an Order
# ***************************************************************
@login_required
@order_routes.route('', methods=['POST'])
def create_order():
    """
    Create a new order with associated order items.

    Returns:
        Response: A JSON representation of the newly created order and its items or an error message.
    """
    form = OrderForm()

    # Validate the form data
    if form.validate_on_submit():
        try:
            # Begin a transaction block
            with db.session.begin_nested():
                # Fetch the user's shopping cart
                shopping_cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()

                if not shopping_cart or not shopping_cart.items:
                    return jsonify({"error": "Shopping cart is empty."}), 400

                # Calculate total price based on cart items
                total_price = sum(item.quantity * item.menu_item.price for item in shopping_cart.items)

                # Create a new order instance with the calculated total price and status from the form
                order = Order(
                    user_id=current_user.id,
                    total_price=total_price,
                    status=form.status.data
                )
                db.session.add(order)

                # Create order items based on shopping cart items
                for cart_item in shopping_cart.items:
                    order_item = OrderItem(
                        menu_item_id=cart_item.menu_item_id,
                        order_id=order.id,
                        quantity=cart_item.quantity
                    )
                    db.session.add(order_item)

                # Clear the shopping cart
                for cart_item in shopping_cart.items:
                    db.session.delete(cart_item)

                # Commit the transaction
                db.session.commit()

            # Normalize and return the response
            order_items = [item.to_dict() for item in order.items]
            normalized_order_items = normalize_data(order_items, 'id')
            return jsonify({
                "entities": {
                    "orders": {
                        "byId": {
                            order.id: order.to_dict()
                        },
                        "allIds": [order.id]
                    },
                    "orderItems": normalized_order_items
                }
            })

        except Exception as e:
            # Roll back in case of any error
            db.session.rollback()
            return jsonify({"error": "An unexpected error occurred while creating the order: " + str(e)}), 500

    # If the form did not validate, return the errors
    return jsonify({'errors': form.errors}), 400

# ***************************************************************
# Endpoint to Create an Order From Cart
# ***************************************************************
@order_routes.route('/create_order', methods=['POST'])
@login_required
def create_order_from_cart():
    try:
        data = request.get_json()
        ic(data)
        total_price, new_order = create_order_logic(data)
        ic(total_price)
        ic(new_order)

        return jsonify({
            'success': True,
            'order_id': new_order.id,
            'total_price': total_price,
            'status': new_order.status,
            'created_at': new_order.created_at.isoformat(),
            'updated_at': new_order.updated_at.isoformat()
        }), HTTPStatus.OK

    except ValueError as ve:
        db.session.rollback()
        return jsonify({'error': str(ve)}), HTTPStatus.BAD_REQUEST
    except SQLAlchemyError as e:
        db.session.rollback()
        # Log the error for debugging
        print(f"Database Error: {e}")
        return jsonify({'error': 'Database operation failed'}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        db.session.rollback()
        # Log the generic error
        print(f"Unexpected Error: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), HTTPStatus.INTERNAL_SERVER_ERROR

# ++++++++++++++++++++++++++++
# Helper Function to Create an Order From Cart
def create_order_logic(data):
    with db.session.begin_nested():  # Starts a nested transaction
        shopping_cart = ShoppingCart.query.options(
            joinedload(ShoppingCart.items)
        ).filter_by(user_id=current_user.id).first()

        if not shopping_cart or not shopping_cart.items:
            raise ValueError("Shopping cart is empty")

        total_price = sum(item.quantity * item.menu_item.price for item in shopping_cart.items)

        delivery_id = data.get('delivery_id')
        payment_id = data.get('payment_id')

        new_order = Order(
            user_id=current_user.id,
            total_price=total_price,
            delivery_id=delivery_id,
            payment_id=payment_id,
            status='Pending',
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
            is_deleted=False
        )
        db.session.add(new_order)
        db.session.flush()

        # Create order items from shopping cart
        for cart_item in shopping_cart.items:
            order_item = OrderItem(
                order_id=new_order.id,
                menu_item_id=cart_item.menu_item_id,
                quantity=cart_item.quantity
            )
            db.session.add(order_item)

        db.session.commit()

        return total_price, new_order

# ***************************************************************
# Endpoint to Get Order Details
# ***************************************************************
@login_required
@order_routes.route('/<int:order_id>', methods=['GET'])
def get_order_details(order_id):
    try:
        logging.info(f"Fetching details for order ID: {order_id}")
        order = Order.query.get(order_id)

        if not order:
            logging.warning(f"Order with ID {order_id} not found.")
            abort(404, description=f"Order with ID {order_id} not found.")

        order_items = OrderItem.query.filter_by(order_id=order_id).all()
        if not order_items:
            logging.warning(f"No order items found for order ID {order_id}")
            abort(404, description=f"No order items found for order ID {order_id}")

        menu_item_ids = [oi.menu_item_id for oi in order_items]
        menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_item_ids)).all()

        order_items_dict = {oi.id: oi.to_dict() for oi in order_items}
        menu_items_dict = {mi.id: mi.to_dict() for mi in menu_items}

        normalized_order_details = {
            'order': order.to_dict(),
            'orderItems': {"byId": order_items_dict, "allIds": list(order_items_dict.keys())},
            'menuItems': {"byId": menu_items_dict, "allIds": list(menu_items_dict.keys())}
        }

        return jsonify(normalized_order_details)

    except SQLAlchemyError as e:
        logging.error(f"Database Error: {e}")
        abort(500, description='Database operation failed')

    except Exception as e:
        logging.error(f"Unexpected Error: {e}")
        abort(500, description='An unexpected error occurred')


# ***************************************************************
# Endpoint to Reorder Past Order
# ***************************************************************
@login_required
@order_routes.route('/<int:order_id>/reorder', methods=['POST'])
def reorder_past_order(order_id):
    """
    Reorders a past order by creating a new order with the same items.

    Args:
        order_id (int): The ID of the past order to reorder.

    Returns:
        Response: A JSON representation of the newly created order and its associated items
                  and menu items, or an error message.
    """
    try:
        # Fetch the past order using the provided ID
        past_order = Order.query.get(order_id)

        # Check if the past order exists
        if not past_order:
            raise ValueError("Order not found.", 404)

        # Check if the current user has permission to reorder the past order
        if past_order.user_id != current_user.id:
            raise PermissionError("You don't have permission to reorder this order.", 403)

        # Create a new order with the same details as the past order
        new_order = Order(
            user_id=current_user.id,
            total_price=past_order.total_price,
            status='Pending'
        )

        # Add the new order to the session and get its ID
        db.session.add(new_order)
        db.session.flush()

         # Prepare a list of new order items
        new_order_items = [
            OrderItem(menu_item_id=item.menu_item_id, order_id=new_order.id, quantity=item.quantity)
            for item in past_order.items
        ]

        # Bulk insert new order items
        db.session.bulk_save_objects(new_order_items)
        db.session.commit()

        # Extract the new order's items and their associated menu items
        order_items = [item.to_dict() for item in new_order.items]
        menu_items_ids = [item['menu_item_id'] for item in order_items]
        menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

        # Normalize the data for order items and menu items for a structured response
        normalized_order_items = normalize_data(order_items, 'id')
        normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

        # Return the new order's details, including the associated items and menu items
        return jsonify({
            "message": "Order has been successfully reordered.",
            "entities": {
                "orders": {
                    "byId": {
                        new_order.id: new_order.to_dict()
                    },
                    "allIds": [new_order.id]
                },
                "orderItems": normalized_order_items,
                "menuItems": normalized_menu_items
            }
        })

    # Handle specific exceptions for meaningful error messages
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except PermissionError as pe:
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        # Catch any other unexpected exceptions
        return jsonify({"error": "An unexpected error occurred while reordering."}), 500

# ***************************************************************
# Endpoint to Get Order Items
# ***************************************************************
@login_required
@order_routes.route('/<int:order_id>/items')
def get_order_items(order_id):
    """
    Retrieve items associated with a specific order.

    Args:
        order_id (int): The ID of the order for which to retrieve items.

    Returns:
        Response: A JSON representation of the order's items and their associated menu items,
                  or an error message.
    """
    try:
        # Fetch the order using the provided ID
        order = Order.query.get(order_id)

        # Check if the order exists
        if not order:
            raise ValueError("Order not found.", 404)

        # Check if the current user has permission to view the order's items
        if order.user_id != current_user.id:
            raise PermissionError("You don't have permission to view items from this order.", 403)

        # Extract the order's items and their associated menu items
        items = [item.to_dict() for item in order.items]
        menu_items_ids = [item['menu_item_id'] for item in items]
        menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

        # Normalize the data for items and menu items for a structured response
        normalized_items = normalize_data(items, 'id')
        normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

        # Return the order's items and their associated menu items
        return jsonify({
            "entities": {
                "orderItems": normalized_items,
                "menuItems": normalized_menu_items
            }
        })

    # Handle specific exceptions for meaningful error messages
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except PermissionError as pe:
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        # Catch any other unexpected exceptions
        return jsonify({"error": "An unexpected error occurred."}), 500

# ***************************************************************
# Endpoint to Delete an Order
# ***************************************************************
@login_required
@order_routes.route('/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """
    Delete a specific order.

    Args:
        order_id (int): The ID of the order to delete.

    Returns:
        Response: A JSON message indicating successful deletion or an error message.
    """
    try:
        order = Order.query.get(order_id)
        if not order:
            raise ValueError("Order not found.")
        if order.user_id != current_user.id:
            raise PermissionError("You don't have permission to delete this order.")

        # Soft delete the order
        order.is_deleted = True
        db.session.commit()

        return jsonify({
            "message": f"Order {order_id} has been successfully marked as deleted."
        })

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except PermissionError as pe:
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred while deleting the order."}), 500

# ***************************************************************
# Endpoint to Update an Order
# ***************************************************************
@login_required
@order_routes.route('/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    """
    Update the status of a specific order.

    Args:
        order_id (int): The ID of the order to update.

    Returns:
        Response: A JSON representation of the updated order or an error message.
    """
    order, is_authorized = is_authorized_to_access_order(current_user, order_id)

    if not order:
        return jsonify({"error": "Order not found."}), 404
    if not is_authorized:
        return jsonify({"error": "Unauthorized."}), 403

    data = request.json
    if 'status' in data:
        order.status = data['status']

    db.session.commit()
    return order.to_dict()

# ***************************************************************
# Endpoint to Cancel an Order
# ***************************************************************
@login_required
@order_routes.route('/<int:order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    """
    Cancel a specific order.

    Args:
        order_id (int): The ID of the order to cancel.

    Returns:
        Response: A JSON representation of the canceled order or an error message.
    """
    order, is_authorized = is_authorized_to_access_order(current_user, order_id)

    if not order:
        return jsonify({"error": "Order not found."}), 404
    if not is_authorized:
        return jsonify({"error": "Unauthorized."}), 403
    if order.status == "Completed":
        return jsonify({"error": "Cannot cancel a completed order."}), 400

    order.status = "Cancelled"
    db.session.commit()

    return order.to_dict()

# ***************************************************************
# Endpoint to Update an Order's Status
# ***************************************************************
@login_required
@order_routes.route('/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """
    Update the status of a specific order. If 'cancel' is provided as status,
    perform the cancel action instead.

    Args:
        order_id (int): The ID of the order to update.

    Returns:
        Response: A JSON representation of the updated order or an error message.
    """
    order, is_authorized = is_authorized_to_access_order(current_user, order_id)

    if not order:
        return jsonify({"error": "Order not found."}), 404
    if not is_authorized:
        return jsonify({"error": "Unauthorized."}), 403

    data = request.json
    status = data.get('status')

    try:
        # raising a ValueError if the status is not valid.
        validate_order_status(status)
        if status.lower() == 'cancel':  # Using lower to ensure case-insensitivity
            if order.status == "Completed":
                return jsonify({"error": "Cannot cancel a completed order."}), 400
            order.status = "Cancelled"
        else:
            order.status = status

        db.session.commit()
        return jsonify(order.to_dict())

    except ValueError as e:
        return jsonify({"error": str(e)}), 400













# from flask import Blueprint, jsonify, request, abort
# from sqlalchemy.orm import joinedload
# from flask_login import login_required, current_user
# from app.models import db, Order, OrderItem, MenuItem
# from app.forms import OrderForm, OrderItemForm
# from ..helper_functions import normalize_data, is_authorized_to_access_order

# # Blueprint for routes related to Orders
# order_routes = Blueprint('orders', __name__)

# # ***************************************************************
# # Endpoint to Get User Orders
# # ***************************************************************
# @login_required
# @order_routes.route('/')
# def get_user_orders():
#     """
#     Retrieve all orders associated with the currently authenticated user.

#     Returns:
#         Response: A JSON representation of the user's orders or an error message.
#     """
#     try:
#         # Fetch orders associated with the current user
#         orders = Order.query.filter_by(user_id=current_user.id).all()

#         if not orders:
#             return jsonify({
#                 "message": "No orders found for the user.",
#                 "entities": {
#                     "orders": {
#                         "byId": {},
#                         "allIds": []
#                     }
#                 }
#             }), 404

#         # Normalize the order data for frontend consumption
#         normalized_orders = normalize_data([order.to_dict() for order in orders], 'id')

#         return jsonify({
#             "entities": {
#                 "orders": normalized_orders
#             }
#         })

#     except Exception as e:
#         # In case of unexpected errors, return a generic error message
#         return jsonify({"error": "An unexpected error occurred while fetching the orders."}), 500

# # ***************************************************************
# # Endpoint to Create an Order
# # ***************************************************************
# # @login_required
# # @order_routes.route('/', methods=['POST'])
# # def create_order():
# #     """
# #     Create a new order with associated order items.

# #     Returns:
# #         Response: A JSON representation of the newly created order and its items or an error message.
# #     """
# #     form = OrderForm()
# #     form['csrf_token'].data = request.cookies['csrf_token']

# #     if form.validate_on_submit():
# #         # Create a new order instance with data from the form
# #         order = Order(
# #             user_id=current_user.id,
# #             total_price=form.total_price.data,
# #             status=form.status.data
# #         )
# #         db.session.add(order)
# #         db.session.flush()  # This is to retrieve the ID of the new order before committing

# #         # Get the items associated with the order from the request
# #         cart_items = request.json.get('items', [])

# #         for item in cart_items:
# #             # For each item, create a new OrderItem instance
# #             menu_item_id = item.get('menu_item_id')
# #             quantity = item.get('quantity')

# #             if not menu_item_id:
# #                 return jsonify({"error": "No menu item specified for an order item."}), 400

# #             if not quantity:
# #                 return jsonify({"error": f"No quantity specified for menu item with ID {menu_item_id}."}), 400

# #             order_item = OrderItem(
# #                 menu_item_id=menu_item_id,
# #                 order_id=order.id,
# #                 quantity=quantity
# #             )
# #             db.session.add(order_item)

# #         db.session.commit()

# #         # Return the created order and associated items in a normalized format
# #         order_items = [item.to_dict() for item in order.items]
# #         normalized_order_items = normalize_data(order_items, 'id')

# #         return jsonify({
# #             "entities": {
# #                 "orders": {
# #                     "byId": {
# #                         order.id: order.to_dict()
# #                     },
# #                     "allIds": [order.id]
# #                 },
# #                 "orderItems": normalized_order_items
# #             }
# #         })
# #     return {'errors': form.errors}, 400
# @login_required
# @order_routes.route('/', methods=['POST'])
# def create_order():
#     """
#     Create a new order with associated order items.

#     Returns:
#         Response: A JSON representation of the newly created order and its items or an error message.
#     """
#     form = OrderForm()

#     # Validate the form data
#     if form.validate_on_submit():
#         try:
#             # Begin a transaction block
#             with db.session.begin_nested():
#                 # Fetch the user's shopping cart
#                 shopping_cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()

#                 if not shopping_cart or not shopping_cart.items:
#                     return jsonify({"error": "Shopping cart is empty."}), 400

#                 # Calculate total price based on cart items
#                 total_price = sum(item.quantity * item.menu_item.price for item in shopping_cart.items)

#                 # Create a new order instance with the calculated total price and status from the form
#                 order = Order(
#                     user_id=current_user.id,
#                     total_price=total_price,
#                     status=form.status.data
#                 )
#                 db.session.add(order)

#                 # Create order items based on shopping cart items
#                 for cart_item in shopping_cart.items:
#                     order_item = OrderItem(
#                         menu_item_id=cart_item.menu_item_id,
#                         order_id=order.id,
#                         quantity=cart_item.quantity
#                     )
#                     db.session.add(order_item)

#                 # Clear the shopping cart
#                 for cart_item in shopping_cart.items:
#                     db.session.delete(cart_item)

#                 # Commit the transaction
#                 db.session.commit()

#             # Normalize and return the response
#             order_items = [item.to_dict() for item in order.items]
#             normalized_order_items = normalize_data(order_items, 'id')
#             return jsonify({
#                 "entities": {
#                     "orders": {
#                         "byId": {
#                             order.id: order.to_dict()
#                         },
#                         "allIds": [order.id]
#                     },
#                     "orderItems": normalized_order_items
#                 }
#             })

#         except Exception as e:
#             # Roll back in case of any error
#             db.session.rollback()
#             return jsonify({"error": "An unexpected error occurred while creating the order: " + str(e)}), 500

#     # If the form did not validate, return the errors
#     return jsonify({'errors': form.errors}), 400


# # ***************************************************************
# # Endpoint to Get Order Details
# # ***************************************************************
# # @login_required
# # @order_routes.route('/<int:order_id>')
# # def get_order_details(order_id):
# #     """
# #     Retrieve details for a specific order, including its associated items and menu items.

# #     Args:
# #         order_id (int): The ID of the order to retrieve.

# #     Returns:
# #         Response: A JSON representation of the order details, including associated items
# #                   and menu items, or an error message.
# #     """
# #     try:
# #         # Fetch the order using the provided ID
# #         order = Order.query.get(order_id)

# #         # Check if the order exists
# #         if not order:
# #             raise ValueError("Order not found.", 404)

# #         # Check if the current user has permission to view the order details
# #         if order.user_id != current_user.id:
# #             raise PermissionError("You don't have permission to view this order.", 403)

# #         # Extract order items and their associated menu items
# #         order_items = [item.to_dict() for item in order.items]
# #         menu_items_ids = [item['menu_item_id'] for item in order_items]
# #         menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

# #         # Normalize the data for order items and menu items for a structured response
# #         normalized_order_items = normalize_data(order_items, 'id')
# #         normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

# #         # Return the order details, including the associated items and menu items
# #         return jsonify({
# #             "entities": {
# #                 "orders": {
# #                     "byId": {
# #                         order.id: order.to_dict()
# #                     },
# #                     "allIds": [order.id]
# #                 },
# #                 "orderItems": normalized_order_items,
# #                 "menuItems": normalized_menu_items
# #             }
# #         })

# #     # Handle specific exceptions for meaningful error messages
# #     except ValueError as ve:
# #         return jsonify({"error": str(ve)}), 404
# #     except PermissionError as pe:
# #         return jsonify({"error": str(pe)}), 403
# #     except Exception as e:
# #         # Catch any other unexpected exceptions
# #         return jsonify({"error": "An unexpected error occurred."}), 500


# @login_required
# @order_routes.route('/<int:order_id>')
# def get_order_details(order_id):
#     """
#     Retrieve details for a specific order, including its associated items and menu items.
#     Args:
#         order_id (int): The ID of the order to retrieve.
#     Returns:
#         Response: A JSON representation of the order details, including associated items
#                   and menu items, or an error message.
#     """
#     try:
#         # Fetch the order with its items and associated menu items using joined loading
#         order = Order.query.options(
#             joinedload(Order.items).joinedload(OrderItem.menu_item)
#         ).filter_by(id=order_id, user_id=current_user.id).first()

#         # Check if the order exists and belongs to the current user
#         if not order:
#             abort(404, description="Order not found or you don't have permission to view it.")

#         # Prepare the order details including the items and their menu item details
#         order_details = order.to_dict()
#         order_details['items'] = [
#             {
#                 **item.to_dict(),
#                 'menu_item': item.menu_item.to_dict()
#             } for item in order.items
#         ]

#         # Return the order details
#         return jsonify(order_details)

#     except HTTPException as http_ex:
#         # Return the HTTP error raised by abort
#         return jsonify({"error": http_ex.description}), http_ex.code
#     except Exception as e:
#         # Catch any other unexpected exceptions
#         return jsonify({"error": "An unexpected error occurred: " + str(e)}), 500


# # ***************************************************************
# # Endpoint to Reorder Past Order
# # ***************************************************************
# @login_required
# @order_routes.route('/<int:order_id>/reorder', methods=['POST'])
# def reorder_past_order(order_id):
#     """
#     Reorders a past order by creating a new order with the same items.

#     Args:
#         order_id (int): The ID of the past order to reorder.

#     Returns:
#         Response: A JSON representation of the newly created order and its associated items
#                   and menu items, or an error message.
#     """
#     try:
#         # Fetch the past order using the provided ID
#         past_order = Order.query.get(order_id)

#         # Check if the past order exists
#         if not past_order:
#             raise ValueError("Order not found.", 404)

#         # Check if the current user has permission to reorder the past order
#         if past_order.user_id != current_user.id:
#             raise PermissionError("You don't have permission to reorder this order.", 403)

#         # Create a new order with the same details as the past order
#         new_order = Order(
#             user_id=current_user.id,
#             total_price=past_order.total_price,
#             status='Pending'
#         )

#         # Add the new order to the session and get its ID
#         db.session.add(new_order)
#         db.session.flush()

#         # Copy the items from the past order to the new order
#         for item in past_order.items:
#             new_order_item = OrderItem(
#                 menu_item_id=item.menu_item_id,
#                 order_id=new_order.id,
#                 quantity=item.quantity
#             )
#             db.session.add(new_order_item)

#         # Commit the changes to the database
#         db.session.commit()

#         # Extract the new order's items and their associated menu items
#         order_items = [item.to_dict() for item in new_order.items]
#         menu_items_ids = [item['menu_item_id'] for item in order_items]
#         menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

#         # Normalize the data for order items and menu items for a structured response
#         normalized_order_items = normalize_data(order_items, 'id')
#         normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

#         # Return the new order's details, including the associated items and menu items
#         return jsonify({
#             "message": "Order has been successfully reordered.",
#             "entities": {
#                 "orders": {
#                     "byId": {
#                         new_order.id: new_order.to_dict()
#                     },
#                     "allIds": [new_order.id]
#                 },
#                 "orderItems": normalized_order_items,
#                 "menuItems": normalized_menu_items
#             }
#         })

#     # Handle specific exceptions for meaningful error messages
#     except ValueError as ve:
#         return jsonify({"error": str(ve)}), 404
#     except PermissionError as pe:
#         return jsonify({"error": str(pe)}), 403
#     except Exception as e:
#         # Catch any other unexpected exceptions
#         return jsonify({"error": "An unexpected error occurred while reordering."}), 500

# # ***************************************************************
# # Endpoint to Get Order Items
# # ***************************************************************
# @login_required
# @order_routes.route('/<int:order_id>/items')
# def get_order_items(order_id):
#     """
#     Retrieve items associated with a specific order.

#     Args:
#         order_id (int): The ID of the order for which to retrieve items.

#     Returns:
#         Response: A JSON representation of the order's items and their associated menu items,
#                   or an error message.
#     """
#     try:
#         # Fetch the order using the provided ID
#         order = Order.query.get(order_id)

#         # Check if the order exists
#         if not order:
#             raise ValueError("Order not found.", 404)

#         # Check if the current user has permission to view the order's items
#         if order.user_id != current_user.id:
#             raise PermissionError("You don't have permission to view items from this order.", 403)

#         # Extract the order's items and their associated menu items
#         items = [item.to_dict() for item in order.items]
#         menu_items_ids = [item['menu_item_id'] for item in items]
#         menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

#         # Normalize the data for items and menu items for a structured response
#         normalized_items = normalize_data(items, 'id')
#         normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

#         # Return the order's items and their associated menu items
#         return jsonify({
#             "entities": {
#                 "orderItems": normalized_items,
#                 "menuItems": normalized_menu_items
#             }
#         })

#     # Handle specific exceptions for meaningful error messages
#     except ValueError as ve:
#         return jsonify({"error": str(ve)}), 404
#     except PermissionError as pe:
#         return jsonify({"error": str(pe)}), 403
#     except Exception as e:
#         # Catch any other unexpected exceptions
#         return jsonify({"error": "An unexpected error occurred."}), 500

# # ***************************************************************
# # Endpoint to Delete an Order
# # ***************************************************************
# @login_required
# @order_routes.route('/<int:order_id>', methods=['DELETE'])
# def delete_order(order_id):
#     """
#     Delete a specific order.

#     Args:
#         order_id (int): The ID of the order to delete.

#     Returns:
#         Response: A JSON message indicating successful deletion or an error message.
#     """
#     try:
#         order = Order.query.get(order_id)
#         if not order:
#             raise ValueError("Order not found.")
#         if order.user_id != current_user.id:
#             raise PermissionError("You don't have permission to delete this order.")

#         db.session.delete(order)
#         db.session.commit()

#         return jsonify({
#             "message": f"Order {order_id} has been successfully deleted."
#         })

#     except ValueError as ve:
#         return jsonify({"error": str(ve)}), 404
#     except PermissionError as pe:
#         return jsonify({"error": str(pe)}), 403
#     except Exception as e:
#         return jsonify({"error": "An unexpected error occurred while deleting the order."}), 500

# # ***************************************************************
# # Endpoint to Update an Order
# # ***************************************************************
# @login_required
# @order_routes.route('/<int:order_id>', methods=['PUT'])
# def update_order(order_id):
#     """
#     Update the status of a specific order.

#     Args:
#         order_id (int): The ID of the order to update.

#     Returns:
#         Response: A JSON representation of the updated order or an error message.
#     """
#     order, is_authorized = is_authorized_to_access_order(current_user, order_id)

#     if not order:
#         return jsonify({"error": "Order not found."}), 404
#     if not is_authorized:
#         return jsonify({"error": "Unauthorized."}), 403

#     data = request.json
#     if 'status' in data:
#         order.status = data['status']

#     db.session.commit()
#     return order.to_dict()

# # ***************************************************************
# # Endpoint to Cancel an Order
# # ***************************************************************
# @login_required
# @order_routes.route('/<int:order_id>/cancel', methods=['POST'])
# def cancel_order(order_id):
#     """
#     Cancel a specific order.

#     Args:
#         order_id (int): The ID of the order to cancel.

#     Returns:
#         Response: A JSON representation of the canceled order or an error message.
#     """
#     order, is_authorized = is_authorized_to_access_order(current_user, order_id)

#     if not order:
#         return jsonify({"error": "Order not found."}), 404
#     if not is_authorized:
#         return jsonify({"error": "Unauthorized."}), 403
#     if order.status == "Completed":
#         return jsonify({"error": "Cannot cancel a completed order."}), 400

#     order.status = "Cancelled"
#     db.session.commit()

#     return order.to_dict()

# # ***************************************************************
# # Endpoint to Update an Order's Status
# # ***************************************************************
# @login_required
# @order_routes.route('/<int:order_id>/status', methods=['PUT'])
# def update_order_status(order_id):
#     """
#     Update the status of a specific order.

#     Args:
#         order_id (int): The ID of the order to update.

#     Returns:
#         Response: A JSON representation of the updated order or an error message.
#     """
#     order, is_authorized = is_authorized_to_access_order(current_user, order_id)

#     if not order:
#         return jsonify({"error": "Order not found."}), 404
#     if not is_authorized:
#         return jsonify({"error": "Unauthorized."}), 403

#     data = request.json
#     if 'status' in data:
#         order.status = data['status']

#     db.session.commit()
#     return order.to_dict()
