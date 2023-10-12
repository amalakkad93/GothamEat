from flask import Blueprint, jsonify, request,redirect, url_for, abort
import app
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, Review, Review, db, Order, OrderItem
from sqlalchemy import func, distinct, or_, desc

import json

order_routes = Blueprint('order', __name__)

# *******************************Get All Orders*******************************
@order_routes.route('/user/<int:user_id>/past_orders')
def get_past_orders(user_id):
    orders = Order.query.filter_by(user_id=user_id).all()
    return jsonify([order.to_dict() for order in orders])

# *******************************Commit New Order*******************************
@order_routes.route('/<int:order_id>/reorder', methods=['POST'])
def reorder(order_id):
    old_order = Order.query.get(order_id)
    if not old_order:
        return jsonify({"error": "Order not found"}), 404

    try:
        with db.session.begin_nested():
            new_order = Order(
                user_id=old_order.user_id,
                total_price=old_order.total_price,
                status="Pending"
            )
            db.session.add(new_order)

            for item in old_order.items:
                new_order_item = OrderItem(
                    menu_item_id=item.menu_item_id,
                    order_id=new_order.id,
                    quantity=item.quantity
                )
                db.session.add(new_order_item)

        db.session.commit()

        return jsonify(new_order.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
