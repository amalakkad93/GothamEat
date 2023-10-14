from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Order, OrderItem, MenuItem, Payment
from app.forms import OrderForm, OrderItemForm
from ..helper_functions import normalize_data

payment_routes = Blueprint('payments', __name__)

# ********** Helper to Validate Payment Data **********
def is_valid_payment_data(data):
    # Validate gateway
    if data['gateway'] not in ["Stripe", "PayPal"]:
        return False, "Invalid payment gateway."

    # Validate amount
    try:
        amount = float(data['amount'])
        if amount <= 0:
            return False, "Invalid payment amount. Amount must be positive."
    except (ValueError, TypeError):
        return False, "Invalid payment amount."

    # Validate status
    valid_statuses = ["Pending", "Completed", "Failed"]
    if data['status'] not in valid_statuses:
        return False, "Invalid payment status."

    # Validate order_id
    try:
        order_id = int(data['order_id'])
        if order_id <= 0:
            return False, "Invalid order ID."
    except (ValueError, TypeError):
        return False, "Order ID must be a positive integer."

    return True, None


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

# *******************************Create a payment*******************************
@login_required
@payment_routes.route('/', methods=['POST'])
def create_payment():
    data = request.json
    valid, error_message = is_valid_payment_data(data)
    if not valid:
        return jsonify({"error": error_message}), 400

    payment = Payment(
        order_id=data['order_id'],
        gateway=data['gateway'],
        amount=data['amount'],
        status=data['status']
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify(payment.to_dict())

# *******************************Update a payment*******************************
@login_required
@payment_routes.route('/<int:id>', methods=['PUT'])
def update_payment(id):
    payment = Payment.query.get(id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    data = request.json
    valid, error_message = is_valid_payment_data(data)
    if not valid:
        return jsonify({"error": error_message}), 400

    if payment.status != "Completed":
        payment.gateway = data.get('gateway', payment.gateway)
        payment.amount = data.get('amount', payment.amount)
        payment.status = data.get('status', payment.status)
        payment.updated_at = datetime.now()

    db.session.commit()
    return jsonify(payment.to_dict())

# *******************************Delete a payment*******************************
@login_required
@payment_routes.route('/<int:id>', methods=['DELETE'])
def delete_payment(id):
    payment = Payment.query.get(id)
    if payment:
        db.session.delete(payment)
        db.session.commit()
        return {"message": f"Deleted payment with id {id}"}
    else:
        return {"error": "Payment not found"}, 404
