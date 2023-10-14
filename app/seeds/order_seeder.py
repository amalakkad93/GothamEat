from random import randint, choice
from sqlalchemy import text
from ..models import db, User, MenuItem, MenuItemImg, Order, OrderItem, ShoppingCartItem, ShoppingCart, environment, SCHEMA


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

                    temp_order_item = OrderItem(menu_item_id=cart_item.menu_item_id, quantity=cart_item.quantity)
                    temp_order_items.append(temp_order_item)

            order = Order(user_id=user.id, status="completed", total_price=total_price)
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
