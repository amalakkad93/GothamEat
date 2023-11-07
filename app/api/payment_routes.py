from datetime import datetime
from flask import Blueprint, jsonify, request
from sqlite3 import OperationalError
from flask_login import login_required, current_user
from app.models import db, Order, OrderItem, MenuItem, Payment
from ..forms import PaymentForm
from ..helper_functions import normalize_data, is_valid_payment_data

payment_routes = Blueprint('payments', __name__)

# ***************************************************************
# Endpoint to Get All Payments
# ***************************************************************
@payment_routes.route('/')
def get_all_payments():
    """
    Fetches and returns all payment records from the database.

    Returns:
        Response: A list of all payment records, or an error message if any issues arise.
    """
    payments = Payment.query.all()
    return jsonify([payment.to_dict() for payment in payments])

# ***************************************************************
# Endpoint to Get Payment by ID
# ***************************************************************
@payment_routes.route('/<int:id>')
def get_payment(id):
    """
    Fetches a specific payment record using its ID.

    Args:
        id (int): The ID of the payment record to retrieve.

    Returns:
        Response: The requested payment record or an error message if not found.
    """
    payment = Payment.query.get(id)
    if payment:
        return jsonify(payment.to_dict())
    else:
        return jsonify({"error": "Payment not found"}), 404

# ***************************************************************
# Endpoint to Create a Payment
# ***************************************************************
# @login_required
# @payment_routes.route('/', methods=['POST'])
# def create_payment():
#     """
#     Creates a new payment record in the database.

#     Returns:
#         Response: The newly created payment record or an error message if validation fails.
#     """
#     data = request.json
#     valid, error_message = is_valid_payment_data(data)
#     if not valid:
#         return jsonify({"error": error_message}), 400

#     payment = Payment(
#         order_id=data['order_id'],
#         gateway=data['gateway'],
#         amount=data['amount'],
#         status=data['status']
#     )
#     db.session.add(payment)
#     db.session.commit()
#     return jsonify(payment.to_dict())
@login_required
@payment_routes.route('/', methods=['POST'])
def create_payment():
    """
    Creates a new payment record in the database.

    Returns:
        Response: The newly created payment record or an error message if validation fails.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid data"}), 400

        # You would replace this with actual form validation
        form = PaymentForm(data=data)
        form['csrf_token'].data = request.cookies['csrf_token']

        if form.validate():
            payment = Payment(**form.data)
            db.session.add(payment)
            db.session.commit()
            return jsonify(payment.to_dict()), 201
        return jsonify({"error": form.errors}), 400

    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500

    except Exception as e:
        print(f"Error creating payment record: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the payment record."}), 500

# ***************************************************************
# Endpoint to Update a Payment
# ***************************************************************
@login_required
@payment_routes.route('/<int:id>', methods=['PUT'])
def update_payment(id):
    """
    Updates an existing payment record in the database.

    Args:
        id (int): The ID of the payment record to update.

    Returns:
        Response: The updated payment record or an error message if validation fails or record is not found.
    """
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

# ***************************************************************
# Endpoint to Delete a Payment
# ***************************************************************
@login_required
@payment_routes.route('/<int:id>', methods=['DELETE'])
def delete_payment(id):
    """
    Deletes a specific payment record using its ID.

    Args:
        id (int): The ID of the payment record to delete.

    Returns:
        Response: A success message if deletion is successful, or an error message if the record is not found.
    """
    payment = Payment.query.get(id)
    if payment:
        db.session.delete(payment)
        db.session.commit()
        return {"message": f"Deleted payment with id {id}"}
    else:
        return {"error": "Payment not found"}, 404
