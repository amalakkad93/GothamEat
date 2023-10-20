from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Order, OrderItem, MenuItem
from app.forms import OrderForm, OrderItemForm
from ..helper_functions import normalize_data, is_authorized_to_access_order

# Blueprint for routes related to Orders
order_routes = Blueprint('orders', __name__)

# ***************************************************************
# Endpoint to Get User Orders
# ***************************************************************
@login_required
@order_routes.route('/')
def get_user_orders():
    """
    Retrieve all orders associated with the currently authenticated user.

    Returns:
        Response: A JSON representation of the user's orders or an error message.
    """
    try:
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
@order_routes.route('/', methods=['POST'])
def create_order():
    """
    Create a new order with associated order items.

    Returns:
        Response: A JSON representation of the newly created order and its items or an error message.
    """
    form = OrderForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        # Create a new order instance with data from the form
        order = Order(
            user_id=current_user.id,
            total_price=form.total_price.data,
            status=form.status.data
        )
        db.session.add(order)
        db.session.flush()  # This is to retrieve the ID of the new order before committing

        # Get the items associated with the order from the request
        cart_items = request.json.get('items', [])

        for item in cart_items:
            # For each item, create a new OrderItem instance
            menu_item_id = item.get('menu_item_id')
            quantity = item.get('quantity')

            if not menu_item_id:
                return jsonify({"error": "No menu item specified for an order item."}), 400

            if not quantity:
                return jsonify({"error": f"No quantity specified for menu item with ID {menu_item_id}."}), 400

            order_item = OrderItem(
                menu_item_id=menu_item_id,
                order_id=order.id,
                quantity=quantity
            )
            db.session.add(order_item)

        db.session.commit()

        # Return the created order and associated items in a normalized format
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
    return {'errors': form.errors}, 400

# ***************************************************************
# Endpoint to Get Order Details
# ***************************************************************
@login_required
@order_routes.route('/<int:order_id>')
def get_order_details(order_id):
    """
    Retrieve details for a specific order, including its associated items and menu items.

    Args:
        order_id (int): The ID of the order to retrieve.

    Returns:
        Response: A JSON representation of the order details, including associated items
                  and menu items, or an error message.
    """
    try:
        # Fetch the order using the provided ID
        order = Order.query.get(order_id)

        # Check if the order exists
        if not order:
            raise ValueError("Order not found.", 404)

        # Check if the current user has permission to view the order details
        if order.user_id != current_user.id:
            raise PermissionError("You don't have permission to view this order.", 403)

        # Extract order items and their associated menu items
        order_items = [item.to_dict() for item in order.items]
        menu_items_ids = [item['menu_item_id'] for item in order_items]
        menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

        # Normalize the data for order items and menu items for a structured response
        normalized_order_items = normalize_data(order_items, 'id')
        normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

        # Return the order details, including the associated items and menu items
        return jsonify({
            "entities": {
                "orders": {
                    "byId": {
                        order.id: order.to_dict()
                    },
                    "allIds": [order.id]
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
        return jsonify({"error": "An unexpected error occurred."}), 500

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

        # Copy the items from the past order to the new order
        for item in past_order.items:
            new_order_item = OrderItem(
                menu_item_id=item.menu_item_id,
                order_id=new_order.id,
                quantity=item.quantity
            )
            db.session.add(new_order_item)

        # Commit the changes to the database
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

        db.session.delete(order)
        db.session.commit()

        return jsonify({
            "message": f"Order {order_id} has been successfully deleted."
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
