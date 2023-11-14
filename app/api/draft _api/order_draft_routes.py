# from flask import Blueprint, jsonify, request, abort, current_app
# from flask_login import login_required, current_user
# from sqlalchemy.orm import joinedload, selectinload
# from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
# from http import HTTPStatus
# from uuid import uuid4
# from app.models import db, Order, OrderItem, MenuItem, ShoppingCart, ShoppingCartItem, Payment, Delivery
# from app.forms import OrderForm, OrderItemForm
# from ...helper_functions import normalize_data, is_authorized_to_access_order, get_payment_gateway_enum
# from ...helper_functions.payment_gateway import PaymentGateway
# import traceback
# import logging
# import datetime

# # Blueprint for routes related to Orders
# order_routes = Blueprint('orders', __name__)
# @order_routes.route('/create_order', methods=['POST'])
# @login_required
# def create_order_from_cart():
#     try:
#         data = request.get_json()

#         # Fetch the shopping cart
#         shopping_cart = ShoppingCart.query.options(
#             joinedload(ShoppingCart.items)
#         ).filter_by(user_id=current_user.id).first()

#         if not shopping_cart or not shopping_cart.items:
#             raise ValueError("Shopping cart is empty")

#         # Calculate the total price
#         total_price = sum(item.quantity * item.menu_item.price for item in shopping_cart.items)

#         # IDs of already created delivery and payment records
#         delivery_id = data.get('delivery_id')
#         payment_id = data.get('payment_id')

#         # Create new Order with the calculated total price, and associated delivery and payment IDs
#         new_order = Order(
#             user_id=current_user.id,
#             total_price=total_price,
#             delivery_id=delivery_id,
#             payment_id=payment_id,
#             status='Pending',  # Assuming the initial status is 'Pending'
#             created_at=datetime.datetime.now(),
#             updated_at=datetime.datetime.now(),
#             is_deleted=False  # Assuming the order is not deleted initially
#         )
#         db.session.add(new_order)
#         db.session.commit()

#         return jsonify({
#             'success': True,
#             'order_id': new_order.id,
#             'total_price': total_price,
#             'status': new_order.status,
#             'created_at': new_order.created_at.isoformat(),
#             'updated_at': new_order.updated_at.isoformat()
#         }), 200

#     except ValueError as ve:
#         db.session.rollback()
#         return jsonify({'error': str(ve)}), 400
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500

# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************


# ***************************************************************
# Endpoint to Create an Order From Cart
# ***************************************************************
# @order_routes.route('/create_order', methods=['POST'])
# @login_required
# def create_order_from_cart():
#     # db.session() is assumed to be a scoped session
#     try:
#         # Start a transaction context
#         with db.session.begin_nested():  # Use begin_nested for SAVEPOINT (nested transaction)
#             shopping_cart = ShoppingCart.query.options(joinedload(ShoppingCart.items)).filter_by(user_id=current_user.id).first()
#             if not shopping_cart or not shopping_cart.items:
#                 return jsonify({'error': 'Shopping cart is empty'}), 400

#             total_price = sum(item.quantity * item.menu_item.price for item in shopping_cart.items)
#             new_order = Order(user_id=current_user.id, total_price=total_price)
#             db.session.add(new_order)
#             db.session.flush()  # Obtain the new order ID

#             order_items = [
#                 OrderItem(menu_item_id=cart_item.menu_item_id, order_id=new_order.id, quantity=cart_item.quantity)
#                 for cart_item in shopping_cart.items
#             ]
#             db.session.bulk_save_objects(order_items)
#             ShoppingCartItem.query.filter_by(shopping_cart_id=shopping_cart.id).delete()

#             payment = Payment(order_id=new_order.id, gateway='Stripe', amount=total_price, status='Completed')
#             db.session.add(payment)

#             # The transaction will be committed automatically at the end of the block

#         # If we reach this point, it means the transaction was successful
#         order_dict = new_order.to_dict()
#         order_dict['items'] = [item.to_dict() for item in order_items]
#         return jsonify(order_dict), 201

#     except IntegrityError as e:
#         current_app.logger.error(f'Integrity error: {str(e)}')
#         return jsonify({'error': 'An integrity error occurred'}), 400

#     except OperationalError as e:
#         current_app.logger.error(f'Operational error: {str(e)}')
#         return jsonify({'error': 'A database operational error occurred'}), 500

#     except Exception as e:
#         current_app.logger.error(f'Unexpected error: {str(e)}')
#         return jsonify({'error': 'An unexpected error occurred'}), 500

#     # finally:
#         # No need to call db.session.close() if using Flask-SQLAlchemy, which handles it automatically

# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************

# logging.basicConfig(level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')

# @order_routes.route('/create_order', methods=['POST'])
# @login_required
# def create_order_from_cart():
#     data = request.get_json()
#     delivery_data = data.get('delivery')
#     payment_data = data.get('payment')

#     new_delivery= None
#     new_payment = None

#     try:
#         # Ensure any existing transaction is closed
#         if db.session.is_active:
#             db.session.rollback()

#         # Fetch the shopping cart
#         shopping_cart = ShoppingCart.query.options(
#             joinedload(ShoppingCart.items)
#         ).filter_by(user_id=current_user.id).first()

#         if not shopping_cart or not shopping_cart.items:
#             raise ValueError("Shopping cart is empty")

#         # Calculate total price and create the Order
#         total_price = sum(item.quantity * item.menu_item.price for item in shopping_cart.items)
#         new_order = Order(user_id=current_user.id, total_price=total_price)
#         db.session.add(new_order)
#         db.session.commit()  # Commit to get new_order.id
#         logging.info(f'Created new order with ID: {new_order.id}')

#         # Create delivery object if delivery data is provided
#         if delivery_data:
#             new_delivery = Delivery(
#                 order_id=new_order.id,
#                 user_id=current_user.id,
#                 street_address=delivery_data['street_address'],
#                 city=delivery_data['city'],
#                 state=delivery_data['state'],
#                 postal_code=delivery_data['postal_code'],
#                 country=delivery_data['country'],
#                 cost=delivery_data.get('cost', 0),
#                 status='Pending',
#                 tracking_number=str(uuid4()),
#                 shipped_at=None,
#                 estimated_delivery=None
#             )
#             db.session.add(new_delivery)
#             db.session.commit()  # Commit to get new_delivery.id
#             new_order.delivery_id = new_delivery.id
#             logging.info(f'Created new delivery with ID: {new_delivery.id}')

#         # Create Payment object if payment data is provided
#         if payment_data:
#             payment_gateway_enum = get_payment_gateway_enum(payment_data['gateway'])
#             new_payment = Payment(
#                 order_id=new_order.id,
#                 gateway=payment_gateway_enum,
#                 amount=total_price,
#                 status='Completed'
#             )
#             db.session.add(new_payment)
#             db.session.commit()  # Commit to get new_payment.id
#             new_order.payment_id = new_payment.id
#             logging.info(f'Created new payment with ID: {new_payment.id}')

#         # After creating and flushing new_delivery and new_payment
#         new_order.delivery_id = new_delivery.id if new_delivery else None
#         new_order.payment_id = new_payment.id if new_payment else None
#         db.session.commit()  # Final commit to save all changes

#         # Refresh the order to ensure all data is up to date
#         db.session.refresh(new_order)

#         # Serialize the order, including related objects
#         order_dict = new_order.to_dict()  # Assuming to_dict() serializes all necessary data

#         return jsonify(order_dict), 201

#     except SQLAlchemyError as e:
#         db.session.rollback()
#         logging.exception('Database error occurred', exc_info=True)
#         return jsonify({'error': str(e)}), 500
#     except Exception as e:
#         db.session.rollback()
#         logging.exception('Unexpected error creating order', exc_info=True)
#         return jsonify({'error': str(e)}), 500
