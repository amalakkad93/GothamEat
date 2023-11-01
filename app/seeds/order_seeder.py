from random import randint, choice
from sqlalchemy import text
from datetime import timedelta
from ..models import db, User, MenuItem, MenuItemImg, Order, OrderItem, ShoppingCartItem, ShoppingCart, environment, SCHEMA

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

def seed_orders_and_order_items():
    all_orders = []
    all_order_items = []

    users = User.query.all()

    for user in users:
        # Randomly decide if a user makes an order
        if randint(0, 1):
            total_price = 0  # Initialize total_price

            cart_items = ShoppingCartItem.query.filter_by(shopping_cart_id=user.shopping_cart.id).all()

            # List to hold temporary order items for the current order
            temp_order_items = []

            for cart_item in cart_items:
                if randint(0, 1):  # Randomly decide to add to order
                    # Update the total price
                    menu_item = MenuItem.query.get(cart_item.menu_item_id)
                    total_price += menu_item.price * cart_item.quantity

                    temp_order_item = OrderItem(
                        menu_item_id=cart_item.menu_item_id,
                        quantity=cart_item.quantity,
                    )
                    temp_order_items.append(temp_order_item)

            order = Order(
                user_id=user.id,
                status="completed",
                total_price=total_price,
                delivery_time=generate_random_delivery_time(),
            )
            db.session.add(order)
            db.session.flush()  # This will assign an ID to the order without committing the transaction

            for temp_order_item in temp_order_items:
                temp_order_item.order_id = order.id
                all_order_items.append(temp_order_item)

    db.session.add_all(all_order_items)
    db.session.commit()

def undo_orders_and_order_items():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.order_items RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.orders RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM order_items"))
        db.session.execute(text("DELETE FROM orders"))
    db.session.commit()
