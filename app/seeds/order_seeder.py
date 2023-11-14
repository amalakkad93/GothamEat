from enum import Enum
from random import randint, choice
from sqlalchemy import text
from datetime import timedelta, datetime
from ..models import db, User, MenuItem, Order, OrderItem, ShoppingCartItem, Payment, Delivery, environment, SCHEMA
# from ..models.payment import PaymentGateway
# from .. import helper_functions as hf
from ..helper_functions import PaymentGateway


# Function to generate a random delivery time in the format "10-25 min"
def generate_random_delivery_time():
    # Generate a random number between 10 and 40
    delivery_time_minutes = randint(10, 40)

    # Generate a random additional time between 15 and 30 minutes
    additional_minutes = randint(15, 30)

    # Calculate the upper bound of the delivery time
    upper_bound_minutes = delivery_time_minutes + additional_minutes

    # Format the delivery time as a string like "10-25 min"
    return f"{delivery_time_minutes}-{upper_bound_minutes} min"


def create_payment(user, total_price):
    # Define the list of available gateways
    available_gateways = ["Stripe", "PayPal", "Credit Card"]

    # Randomly choose a gateway
    gateway_choice = choice(available_gateways)

    # Create the Payment instance with the chosen gateway
    payment = Payment(
        # order_id=order_id,
        gateway=gateway_choice,
        amount=total_price,
        status=choice(["Pending", "Completed", "Failed"]),
    )
    db.session.add(payment)
    return payment




def create_delivery(user):
    delivery = Delivery(
        # order_id=order_id,
        user_id=user.id,
        street_address="123 Main St",  # Placeholder for a real address
        city="Anytown",
        state="Anystate",
        postal_code="12345",
        country="Countryland",
        cost=randint(5, 20),  # Placeholder for a real delivery cost
        status=choice(["Pending", "Shipped", "Delivered"]),
        shipped_at=datetime.now() + timedelta(days=randint(1, 5)),  # Placeholder for real shipping date
        estimated_delivery=datetime.now() + timedelta(days=randint(3, 10))  # Placeholder for real delivery date
    )
    db.session.add(delivery)
    return delivery

def seed_orders_and_order_items():
    users = User.query.all()

    for user in users:
        if randint(0, 1):  # Randomly decide if a user makes an order
            total_price = 0
            temp_order_items = []

            # Process cart items
            cart_items = ShoppingCartItem.query.filter_by(shopping_cart_id=user.shopping_cart.id).all()
            for cart_item in cart_items:
                if randint(0, 1):  # Randomly decide to add to order
                    menu_item = MenuItem.query.get(cart_item.menu_item_id)
                    total_price += menu_item.price * cart_item.quantity
                    temp_order_item = OrderItem(
                        menu_item_id=cart_item.menu_item_id,
                        quantity=cart_item.quantity,
                    )
                    temp_order_items.append(temp_order_item)

            # Create Order first without payment_id and delivery_id, flush to get its ID
            order = Order(
                user_id=user.id,
                status="completed",
                total_price=total_price,
                delivery_time=generate_random_delivery_time(),
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
            db.session.add(order)
            db.session.flush()  # Flush to get order ID

            # Associate order items with the order
            for temp_order_item in temp_order_items:
                temp_order_item.order_id = order.id
                db.session.add(temp_order_item)

            # Create Payment and Delivery with the order's ID
            payment = create_payment(user, total_price)
            delivery = create_delivery(user)
            db.session.add(payment)
            db.session.add(delivery)
            db.session.flush()  # Flush to get payment and delivery IDs

            # Update Order with payment_id and delivery_id
            order.payment_id = payment.id
            order.delivery_id = delivery.id

            # Commit once after processing all users
            db.session.commit()




def undo_orders_and_order_items():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.order_items RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.orders RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM order_items"))
        db.session.execute(text("DELETE FROM orders"))
    db.session.commit()

# from enum import Enum
# from random import randint, choice
# from sqlalchemy import text
# from datetime import timedelta, datetime
# from ..models import db, User, MenuItem, Order, OrderItem, ShoppingCartItem, Payment, Delivery, environment, SCHEMA
# # from ..models.payment import PaymentGateway
# # from .. import helper_functions as hf
# from ..helper_functions import PaymentGateway


# # Function to generate a random delivery time in the format "10-25 min"
# def generate_random_delivery_time():
#     # Generate a random number between 10 and 40
#     delivery_time_minutes = randint(10, 40)

#     # Generate a random additional time between 15 and 30 minutes
#     additional_minutes = randint(15, 30)

#     # Calculate the upper bound of the delivery time
#     upper_bound_minutes = delivery_time_minutes + additional_minutes

#     # Format the delivery time as a string like "10-25 min"
#     return f"{delivery_time_minutes}-{upper_bound_minutes} min"


# def create_payment(user, total_price):
#     # Define the list of available gateways
#     available_gateways = ["Stripe", "PayPal", "Credit Card"]

#     # Randomly choose a gateway
#     gateway_choice = choice(available_gateways)

#     # Create the Payment instance with the chosen gateway
#     payment = Payment(

#         gateway=gateway_choice,
#         amount=total_price,
#         status=choice(["Pending", "Completed", "Failed"]),
#     )
#     db.session.add(payment)
#     return payment




# def create_delivery(user):
#     delivery = Delivery(

#         user_id=user.id,
#         street_address="123 Main St",  # Placeholder for a real address
#         city="Anytown",
#         state="Anystate",
#         postal_code="12345",
#         country="Countryland",
#         cost=randint(5, 20),  # Placeholder for a real delivery cost
#         status=choice(["Pending", "Shipped", "Delivered"]),
#         shipped_at=datetime.now() + timedelta(days=randint(1, 5)),  # Placeholder for real shipping date
#         estimated_delivery=datetime.now() + timedelta(days=randint(3, 10))  # Placeholder for real delivery date
#     )
#     db.session.add(delivery)
#     return delivery

# def seed_orders_and_order_items():
#     users = User.query.all()

#     for user in users:
#         if randint(0, 1):  # Randomly decide if a user makes an order
#             total_price = 0  # Initialize total_price
#             temp_order_items = []

#             cart_items = ShoppingCartItem.query.filter_by(shopping_cart_id=user.shopping_cart.id).all()
#             for cart_item in cart_items:
#                 if randint(0, 1):  # Randomly decide to add to order
#                     menu_item = MenuItem.query.get(cart_item.menu_item_id)
#                     total_price += menu_item.price * cart_item.quantity
#                     temp_order_item = OrderItem(
#                         menu_item_id=cart_item.menu_item_id,
#                         quantity=cart_item.quantity,
#                     )
#                     temp_order_items.append(temp_order_item)

#             # Create Payment and Delivery first
#             payment = create_payment(user, total_price)
#             delivery = create_delivery(user)
#             db.session.add(payment)
#             db.session.add(delivery)
#             db.session.flush()  # Flush to get payment and delivery IDs

#             # Create Order with payment_id and delivery_id
#             order = Order(
#                 user_id=user.id,
#                 payment_id=payment.id,
#                 delivery_id=delivery.id,
#                 status="completed",
#                 total_price=total_price,
#                 delivery_time=generate_random_delivery_time(),
#                 created_at=datetime.now(),
#                 updated_at=datetime.now(),
#             )
#             db.session.add(order)

#             # Associate order items with the order
#             for temp_order_item in temp_order_items:
#                 temp_order_item.order_id = order.id
#                 db.session.add(temp_order_item)

#             # Commit at the end
#             db.session.commit()


# def undo_orders_and_order_items():
#     if environment == "production":
#         db.session.execute(f"TRUNCATE table {SCHEMA}.order_items RESTART IDENTITY CASCADE;")
#         db.session.execute(f"TRUNCATE table {SCHEMA}.orders RESTART IDENTITY CASCADE;")
#     else:
#         db.session.execute(text("DELETE FROM order_items"))
#         db.session.execute(text("DELETE FROM orders"))
#     db.session.commit()


# from random import randint, choice
# from sqlalchemy import text
# from datetime import timedelta
# from ..models import db, User, MenuItem, MenuItemImg, Order, OrderItem, ShoppingCartItem, ShoppingCart, environment, SCHEMA

# # Function to generate a random delivery time in the format "10-25 min"
# def generate_random_delivery_time():
#     # Generate a random number between 10 and 40
#     delivery_time_minutes = randint(10, 40)

#     # Generate a random additional time between 15 and 30 minutes
#     additional_minutes = randint(15, 30)

#     # Calculate the upper bound of the delivery time
#     upper_bound_minutes = delivery_time_minutes + additional_minutes

#     # Format the delivery time as a string like "10-25 min"
#     return f"{delivery_time_minutes}-{upper_bound_minutes} min"

# def seed_orders_and_order_items():
#     all_orders = []
#     all_order_items = []

#     users = User.query.all()

#     for user in users:
#         # Randomly decide if a user makes an order
#         if randint(0, 1):
#             total_price = 0  # Initialize total_price

#             cart_items = ShoppingCartItem.query.filter_by(shopping_cart_id=user.shopping_cart.id).all()

#             # List to hold temporary order items for the current order
#             temp_order_items = []

#             for cart_item in cart_items:
#                 if randint(0, 1):  # Randomly decide to add to order
#                     # Update the total price
#                     menu_item = MenuItem.query.get(cart_item.menu_item_id)
#                     total_price += menu_item.price * cart_item.quantity

#                     temp_order_item = OrderItem(
#                         menu_item_id=cart_item.menu_item_id,
#                         quantity=cart_item.quantity,
#                     )
#                     temp_order_items.append(temp_order_item)

#             order = Order(
#                 user_id=user.id,
#                 status="completed",
#                 total_price=total_price,
#                 delivery_time=generate_random_delivery_time(),
#             )
#             db.session.add(order)
#             db.session.flush()  # This will assign an ID to the order without committing the transaction

#             for temp_order_item in temp_order_items:
#                 temp_order_item.order_id = order.id
#                 all_order_items.append(temp_order_item)

#     db.session.add_all(all_order_items)
#     db.session.commit()

# def undo_orders_and_order_items():
#     if environment == "production":
#         db.session.execute(f"TRUNCATE table {SCHEMA}.order_items RESTART IDENTITY CASCADE;")
#         db.session.execute(f"TRUNCATE table {SCHEMA}.orders RESTART IDENTITY CASCADE;")
#     else:
#         db.session.execute(text("DELETE FROM order_items"))
#         db.session.execute(text("DELETE FROM orders"))
#     db.session.commit()
