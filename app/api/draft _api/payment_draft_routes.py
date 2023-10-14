from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Order, OrderItem, MenuItem, Payment
from app.forms import OrderForm, OrderItemForm
from ..helper_functions import normalize_data

payment_routes = Blueprint('payments', __name__)

# *******************************Get all payments*******************************
@payment_routes.route('/')
def get_all_payments():
    payments = Payment.query.all()
    return jsonify([payment.to_dict() for payment in payments])

# *******************************Get payment by ID*******************************
@payment_routes.route('/<int:id>')
def get_payment(id):
    payment = Payment.query.get(id)
    if payment:
        return jsonify(payment.to_dict())
    else:
        return jsonify({"error": "Payment not found"}), 404

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

# *******************************Create a payment*******************************
@payment_routes.route('/', methods=['POST'])
@login_required
def create_payment():
    data = request.json
    order_id = data['order_id']
    order, is_authorized = is_authorized_to_access_order(current_user, order_id)
    if not is_authorized:
        return jsonify({"error": "Unauthorized."}), 403

    payment = Payment(
        order_id=order_id,
        gateway=data['gateway'],
        stripe_payment_intent_id=data.get('stripe_payment_intent_id', None),
        stripe_payment_method_id=data.get('stripe_payment_method_id', None),
        paypal_transaction_id=data.get('paypal_transaction_id', None),
        amount=data['amount'],
        status=data['status']
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify(payment.to_dict())

# *******************************Update a payment*******************************
@payment_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_payment(id):
    payment = Payment.query.get(id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    order, is_authorized = is_authorized_to_access_order(current_user, payment.order_id)
    if not is_authorized:
        return jsonify({"error": "Unauthorized."}), 403

    data = request.json
    payment.gateway = data.get('gateway', payment.gateway)
    payment.stripe_payment_intent_id = data.get('stripe_payment_intent_id', payment.stripe_payment_intent_id)
    payment.stripe_payment_method_id = data.get('stripe_payment_method_id', payment.stripe_payment_method_id)
    payment.paypal_transaction_id = data.get('paypal_transaction_id', payment.paypal_transaction_id)
    payment.amount = data.get('amount', payment.amount)
    payment.status = data.get('status', payment.status)
    payment.updated_at = datetime.now()
    db.session.commit()
    return jsonify(payment.to_dict())

# *******************************Delete a payment*******************************
@payment_routes.route('/<int:id>', methods=['DELETE'])
def delete_payment(id):
    payment = Payment.query.get(id)
    if payment:
        db.session.delete(payment)
        db.session.commit()
        return {"message": f"Deleted payment with id {id}"}
    else:
        return {"error": "Payment not found"}, 404



# # *******************************Create a payment*******************************
# @payment_routes.route('/', methods=['POST'])
# def create_payment():
#     data = request.json
#     payment = Payment(
#         order_id=data['order_id'],
#         method=data['method'],
#         status=data['status'],
#         created_at=datetime.now(),
#         updated_at=datetime.now()
#     )
#     db.session.add(payment)
#     db.session.commit()
#     return jsonify(payment.to_dict())

# # *******************************Update a payment*******************************
# @payment_routes.route('/<int:id>', methods=['PUT'])
# def update_payment(id):
#     payment = Payment.query.get(id)
#     if not payment:
#         return jsonify({"error": "Payment not found"}), 404
#     data = request.json
#     payment.method = data.get('method', payment.method)
#     payment.status = data.get('status', payment.status)
#     payment.updated_at = datetime.now()
#     db.session.commit()
#     return jsonify(payment.to_dict())
