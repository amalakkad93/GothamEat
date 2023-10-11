# api/payment_routes.py

from flask import Blueprint, jsonify, request
from datetime import datetime
from ..models import db, Payment

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

# *******************************Create a payment*******************************
@payment_routes.route('/', methods=['POST'])
def create_payment():
    data = request.json
    payment = Payment(
        order_id=data['order_id'],
        method=data['method'],
        status=data['status'],
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify(payment.to_dict())

# *******************************Update a payment*******************************
@payment_routes.route('/<int:id>', methods=['PUT'])
def update_payment(id):
    payment = Payment.query.get(id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404
    data = request.json
    payment.method = data.get('method', payment.method)
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
