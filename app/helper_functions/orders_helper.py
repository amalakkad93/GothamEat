from flask import current_app, jsonify, request
from flask_login import  current_user
from icecream import ic
from datetime import datetime
import requests
from .normalize_data import normalize_data

import os
import datetime

# ++++++++++++++++++++++++++++
# Helper Function to Create an Order
def create_new_order(data, total_price):
    from app.models import db, Order, OrderItem
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
    current_app.logger.info(f"Creating order with data: User ID: {current_user.id}, Total Price: {total_price}, Delivery ID: {delivery_id}, Payment ID: {payment_id}")
    db.session.add(new_order)
    return new_order

# ++++++++++++++++++++++++++++
# Helper Function to Create an Order Item
def create_order_items(shopping_cart, new_order):
    # from app.models import db, Order, OrderItem
    from ..models import db, Order, OrderItem
    db.session.add(new_order)
    db.session.flush()
    for cart_item in shopping_cart.items:
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=cart_item.menu_item_id,
            quantity=cart_item.quantity
        )
        db.session.add(order_item)
    current_app.logger.info("Order items created successfully")




# Define a function to create a new delivery record
def create_new_delivery(current_user, past_delivery):
    BASE_URL = get_api_base_url()
    DELIVERY_API_URL = f"{BASE_URL}/api/delivery"

    delivery_data = {
        "user_id": current_user.id,
        "street_address": past_delivery.street_address,
        "city": past_delivery.city,
        "state": past_delivery.state,
        "postal_code": past_delivery.postal_code,
        "country": past_delivery.country,
        "cost": past_delivery.cost,
        "status": 'Pending',
    }

    response = requests.post(DELIVERY_API_URL, json=delivery_data)
    response.raise_for_status()
    return response.json()

# Define a function to create a new payment record
def create_new_payment(past_payment):
    BASE_URL = get_api_base_url()
    PAYMENT_API_URL = f"{BASE_URL}/api/payments"

    payment_data = {
        "gateway": past_payment.gateway,
        "amount": past_payment.amount,
        "status": 'Pending',
    }

    if past_payment.gateway == 'Credit Card':
        payment_data.update({
            "cardholder_name": past_payment.cardholder_name,
            "card_number": past_payment.card_number,
            "card_expiry_month": past_payment.card_expiry_month,
            "card_expiry_year": past_payment.card_expiry_year,
            "card_cvc": past_payment.card_cvc,
            "postal_code": past_payment.postal_code,
        })

    response = requests.post(PAYMENT_API_URL, json=payment_data)
    response.raise_for_status()
    return response.json()

# Define a function to fetch additional details
def fetch_additional_details(new_order):
    from app.models import  MenuItem
    order_items = [item.to_dict() for item in new_order.items]
    menu_items_ids = [item['menu_item_id'] for item in order_items]
    menu_items = MenuItem.query.filter(MenuItem.id.in_(menu_items_ids)).all()
    normalized_order_items = normalize_data(order_items, 'id')
    normalized_menu_items = normalize_data([item.to_dict() for item in menu_items], 'id')
    return normalized_order_items, normalized_menu_items

# Define a function to get the API base URL based on the environment
def get_api_base_url():
    if os.environ.get("FLASK_ENV") == "production":
        return os.environ.get("PRODUCTION_API_BASE_URL")
    else:
        return os.environ.get("DEVELOPMENT_API_BASE_URL")
