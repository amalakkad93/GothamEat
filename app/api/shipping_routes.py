from flask import Blueprint, request, jsonify, abort
from app.models import User, db, MenuItem, ShoppingCart, ShoppingCartItem, Order, OrderItem, Payment, Shipping
from ..forms import ShippingForm
from sqlite3 import OperationalError
from sqlalchemy.exc import SQLAlchemyError
import uuid
import logging

logging.basicConfig(level=logging.INFO)
shipping_routes = Blueprint('shipping_routes', __name__)

@shipping_routes.route('', methods=['GET'])
def get_shippings():
    shippings = Shipping.query.all()
    return jsonify([shipping.to_dict() for shipping in shippings]), 200

@shipping_routes.route('/<int:shipping_id>', methods=['GET'])
def get_shipping(shipping_id):
    shipping = Shipping.query.get(shipping_id)
    if shipping:
        return jsonify(shipping.to_dict()), 200
    else:
        return abort(404, description="Shipping record not found")

# @shipping_routes.route('/', methods=['POST'])
# def create_shipping():
#     # Create a new shipping record
#     data = request.json
#     new_shipping = Shipping(
#         user_id=data.get('user_id'),
#         order_id=data.get('order_id'),
#         street_address=data.get('street_address'),
#         city=data.get('city'),
#         state=data.get('state'),
#         postal_code=data.get('postal_code'),
#         country=data.get('country'),
#         shipping_type=data.get('shipping_type'),
#         cost=data.get('cost'),
#         status=data.get('status'),
#         tracking_number=data.get('tracking_number'),
#         shipped_at=data.get('shipped_at'),
#         estimated_delivery=data.get('estimated_delivery'),
#     )
#     db.session.add(new_shipping)
#     db.session.commit()
#     return jsonify(new_shipping.to_dict()), 201

# @shipping_routes.route('/<int:shipping_id>', methods=['PUT'])
# def update_shipping(shipping_id):

#     shipping = Shipping.query.get(shipping_id)
#     if shipping:
#         data = request.json

#         shipping.address = data.get('address', shipping.address)
#         shipping.city = data.get('city', shipping.city)
#         shipping.state = data.get('state', shipping.state)
#         shipping.postal_code = data.get('postal_code', shipping.postal_code)
#         shipping.country = data.get('country', shipping.country)
#         shipping.shipping_type = data.get('shipping_type', shipping.shipping_type)
#         shipping.cost = data.get('cost', shipping.cost)
#         shipping.status = data.get('status', shipping.status)
#         shipping.tracking_number = data.get('tracking_number', shipping.tracking_number)
#         shipping.shipped_at = data.get('shipped_at', shipping.shipped_at)
#         shipping.estimated_delivery = data.get('estimated_delivery', shipping.estimated_delivery)

#         db.session.commit()
#         return jsonify(shipping.to_dict()), 200
#     else:
#         return abort(404, description="Shipping record not found")
@shipping_routes.route('', methods=['POST'])
def create_shipping():
    """
    Creates a new shipping record in the database.

    Returns:
        Response: The newly created shipping record or an error message if validation fails.
    """
    logging.info("*********************Accessed the create_shipping route*********************")
    try:
        data = request.get_json()
        if not data:
            logging.error("No data received for shipping creation.")
            return jsonify({"error": "Invalid data"}), 400

        form = ShippingForm(data=data)
        form['csrf_token'].data = request.cookies['csrf_token']
        if form.validate():
            # Ensure non-nullable fields have default values if None
            new_shipping = Shipping(
                user_id=data.get('user_id'),
                order_id=data.get('order_id'),
                street_address=data.get('street_address', ''),
                city=data.get('city', ''),
                state=data.get('state', ''),
                postal_code=data.get('postal_code', ''),
                country=data.get('country', ''),
                cost=data.get('cost', 0.0),  # Assuming cost is a float, default to 0.0
                status=data.get('status', 'Pending'),  # Default to 'Pending' if status is None
                # shipped_at=data.get('shipped_at'),
                # estimated_delivery=data.get('estimated_delivery'),
                tracking_number=str(uuid.uuid4())
               
            )
            db.session.add(new_shipping)
            db.session.commit()
            return jsonify(new_shipping.to_dict()), 201
        else:
            logging.error("Form validation failed: %s", form.errors)
            return jsonify({"error": form.errors}), 400

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error("SQLAlchemyError occurred: %s", e)
        return jsonify({"error": "Database operation failed."}), 500

    except Exception as e:
        logging.error("Form validation failed: %s", form.errors)
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the shipping record."}), 500



@shipping_routes.route('/<int:shipping_id>', methods=['DELETE'])
def delete_shipping(shipping_id):

    shipping = Shipping.query.get(shipping_id)
    if shipping:
        db.session.delete(shipping)
        db.session.commit()
        return jsonify({}), 204
    else:
        return abort(404, description="Shipping record not found")

# @shipping_routes.route('/users/<int:user_id>/shippings', methods=['GET'])
# def get_user_shippings(user_id):

#     user = User.query.get(user_id)
#     if user:
#         shippings = Shipping.query.filter_by(user_id=user_id).all()
#         return jsonify([shipping.to_dict() for shipping in shippings]), 200
#     else:
#         return abort(404, description="User not found")

@shipping_routes.route('/<int:shipping_id>/track', methods=['GET'])
def track_shipping(shipping_id):
    shipping = Shipping.query.get(shipping_id)
    if shipping:

        tracking_info = {
            'status': shipping.status,
            'tracking_number': shipping.tracking_number,
            'shipped_at': shipping.shipped_at.isoformat() if shipping.shipped_at else None,
            'estimated_delivery': shipping.estimated_delivery.isoformat() if shipping.estimated_delivery else None,
        }
        return jsonify(tracking_info), 200
    else:
        return abort(404, description="Shipping record not found")
