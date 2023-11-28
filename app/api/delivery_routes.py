from flask import Blueprint, request, jsonify, abort
from app.models import (
    User,
    db,
    MenuItem,
    ShoppingCart,
    ShoppingCartItem,
    Order,
    OrderItem,
    Payment,
    Delivery,
)
from ..forms import DeliveryForm
from sqlite3 import OperationalError
from sqlalchemy.exc import SQLAlchemyError
import uuid
import logging

delivery = 0
logging.basicConfig(level=logging.INFO)
delivery_routes = Blueprint("delivery_routes", __name__)


@delivery_routes.route("", methods=["GET"])
def get_deliverys():
    deliverys = Delivery.query.all()
    return jsonify([delivery.to_dict() for delivery in deliverys]), 200


@delivery_routes.route("/<int:delivery_id>", methods=["GET"])
def get_delivery(delivery_id):
    delivery = Delivery.query.get(delivery_id)
    if delivery:
        return jsonify(delivery.to_dict()), 200
    else:
        return abort(404, description="Delivery record not found")


@delivery_routes.route("", methods=["POST"])
def create_delivery():
    """
    Creates a new delivery record in the database.

    Returns:
        Response: The newly created delivery record or an error message if validation fails.
    """
    logging.info(
        "*********************Accessed the create_delivery route*********************"
    )
    try:
        data = request.get_json()
        if not data:
            logging.error("No data received for delivery creation.")
            return jsonify({"error": "Invalid data"}), 400

        form = DeliveryForm(data=data)
        # form["csrf_token"].data = request.cookies["csrf_token"]
        if form.validate():
            new_delivery = Delivery(
                user_id=data.get("user_id"),
                # order_id=order_id,
                street_address=data.get("street_address", ""),
                city=data.get("city", ""),
                state=data.get("state", ""),
                postal_code=data.get("postal_code", ""),
                country=data.get("country", ""),
                cost=data.get("cost", 0.0),
                status=data.get("status", "Pending"),
                tracking_number=str(uuid.uuid4()),
            )
            db.session.add(new_delivery)
            db.session.commit()
            return jsonify(new_delivery.to_dict()), 201
        else:
            logging.error("Form validation failed: %s", form.errors)
            return jsonify({"error": form.errors}), 400

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error("SQLAlchemyError occurred: %s", e)
        return jsonify({"error": "Database operation failed."}), 500

    except Exception as e:
        logging.error("Unexpected error occurred: %s", e)
        db.session.rollback()
        return (
            jsonify({"error": "An error occurred while creating the delivery record."}),
            500,
        )


@delivery_routes.route("/<int:delivery_id>", methods=["DELETE"])
def delete_delivery(delivery_id):
    delivery = Delivery.query.get(delivery_id)
    if delivery:
        db.session.delete(delivery)
        db.session.commit()
        return jsonify({}), 204
    else:
        return abort(404, description="delivery record not found")


@delivery_routes.route("/<int:delivery_id>/track", methods=["GET"])
def track_delivery(delivery_id):
    delivery = Delivery.query.get(delivery_id)
    if delivery:
        tracking_info = {
            "status": delivery.status,
            "tracking_number": delivery.tracking_number,
            "shipped_at": delivery.shipped_at.isoformat()
            if delivery.shipped_at
            else None,
            "estimated_delivery": delivery.estimated_delivery.isoformat()
            if delivery.estimated_delivery
            else None,
        }
        return jsonify(tracking_info), 200
    else:
        return abort(404, description="delivery record not found")
