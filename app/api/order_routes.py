from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Order, OrderItem, MenuItem
from app.forms import OrderForm, OrderItemForm
from ..helper_functions import normalize_data

order_routes = Blueprint('orders', __name__)

# *******************************Get User Orders*******************************
@login_required
@order_routes.route('/')
def get_user_orders():
    try:
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

        normalized_orders = normalize_data([order.to_dict() for order in orders], 'id')

        return jsonify({
            "entities": {
                "orders": normalized_orders
            }
        })

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred while fetching the orders."}), 500

# *******************************Create an Orders*******************************
@login_required
@order_routes.route('/', methods=['POST'])
def create_order():
    form = OrderForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        order = Order(
            user_id=current_user.id,
            total_price=form.total_price.data,
            status=form.status.data
        )
        db.session.add(order)
        db.session.flush()  # To get the new_order's ID before committing

        # Get the items from the request
        cart_items = request.json.get('items', [])  # This assumes the frontend sends items in a key named 'items'

        for item in cart_items:
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

        # Return the created order and its associated items
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



# *******************************Get Order Details*******************************
@login_required
@order_routes.route('/<int:order_id>')
def get_order_details(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            raise ValueError("Order not found.", 404)
        if order.user_id != current_user.id:
            raise PermissionError("You don't have permission to view this order.", 403)

        order_items = [item.to_dict() for item in order.items]
        menu_items_ids = [item['menu_item_id'] for item in order_items]
        menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

        normalized_order_items = normalize_data(order_items, 'id')
        normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

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
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except PermissionError as pe:
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred."}), 500

# *******************************Reorder Past Order*******************************
@login_required
@order_routes.route('/<int:order_id>/reorder', methods=['POST'])
def reorder_past_order(order_id):
    try:
        past_order = Order.query.get(order_id)
        if not past_order:
            raise ValueError("Order not found.", 404)
        if past_order.user_id != current_user.id:
            raise PermissionError("You don't have permission to reorder this order.", 403)

        new_order = Order(
            user_id=current_user.id,
            total_price=past_order.total_price,
            status='Pending'
        )

        db.session.add(new_order)
        db.session.flush()  # To get the new_order's ID

        for item in past_order.items:
            new_order_item = OrderItem(
                menu_item_id=item.menu_item_id,
                order_id=new_order.id,
                quantity=item.quantity
            )
            db.session.add(new_order_item)

        db.session.commit()

        order_items = [item.to_dict() for item in new_order.items]
        menu_items_ids = [item['menu_item_id'] for item in order_items]
        menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

        normalized_order_items = normalize_data(order_items, 'id')
        normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

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

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except PermissionError as pe:
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred while reordering."}), 500

# *******************************Get Order Item*******************************
@login_required
@order_routes.route('/<int:order_id>/items')
def get_order_items(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            raise ValueError("Order not found.", 404)
        if order.user_id != current_user.id:
            raise PermissionError("You don't have permission to view items from this order.", 403)

        items = [item.to_dict() for item in order.items]
        menu_items_ids = [item['menu_item_id'] for item in items]
        menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()

        normalized_items = normalize_data(items, 'id')
        normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')

        return jsonify({
            "entities": {
                "orderItems": normalized_items,
                "menuItems": normalized_menu_items
            }
        })

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except PermissionError as pe:
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred."}), 500

# *******************************Delete Order*******************************
@login_required
@order_routes.route('/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            raise ValueError("Order not found.", 404)
        if order.user_id != current_user.id:
            raise PermissionError("You don't have permission to delete this order.", 403)

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

# *****************************************************************
# ********** Check User's Authorization for Order Access **********
# *****************************************************************
def is_authorized_to_access_order(user, order_id):
    # Fetch the order and related restaurant ID
    print(db.session.query(Order, MenuItem)
      .join(OrderItem, Order.id == OrderItem.order_id)
      .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
      .filter(Order.id == order_id))

    order = (db.session.query(Order, MenuItem)
             .join(OrderItem, Order.id == OrderItem.order_id)
             .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
             .filter(Order.id == order_id)
             .first())

    if not order:
        return None, False

    order_instance, menu_item_instance = order
    if user.id == order_instance.user_id or user.id == menu_item_instance.restaurant_id:
        return order_instance, True

    return None, False

# *******************************Update Order*******************************
@login_required
@order_routes.route('/<int:order_id>', methods=['PUT'])
def update_order(order_id):
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

# *******************************Cancel Order*******************************
@login_required
@order_routes.route('/<int:order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
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

#  *******************************Order Status*******************************
@login_required
@order_routes.route('/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
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



# order_routes = Blueprint('order', __name__)

# # *******************************Get All Orders*******************************
# @order_routes.route('/user/<int:user_id>/past_orders')
# def get_past_orders(user_id):
#     orders = Order.query.filter_by(user_id=user_id).all()
#     return jsonify([order.to_dict() for order in orders])

# # *******************************Commit New Order*******************************
# @order_routes.route('/<int:order_id>/reorder', methods=['POST'])
# def reorder(order_id):
#     old_order = Order.query.get(order_id)
#     if not old_order:
#         return jsonify({"error": "Order not found"}), 404

#     try:
#         with db.session.begin_nested():
#             new_order = Order(
#                 user_id=old_order.user_id,
#                 total_price=old_order.total_price,
#                 status="Pending"
#             )
#             db.session.add(new_order)

#             for item in old_order.items:
#                 new_order_item = OrderItem(
#                     menu_item_id=item.menu_item_id,
#                     order_id=new_order.id,
#                     quantity=item.quantity
#                 )
#                 db.session.add(new_order_item)

#         db.session.commit()

#         return jsonify(new_order.to_dict())

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500
