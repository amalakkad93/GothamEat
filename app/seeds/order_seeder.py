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
            order = Order(user_id=user.id, status="completed")  # Assuming status for simplicity
            all_orders.append(order)

            # Convert some or all shopping cart items to order items
            cart_items = ShoppingCartItem.query.filter_by(shopping_cart_id=user.shopping_cart.id).all()

            for cart_item in cart_items:
                if randint(0, 1):  # Randomly decide to add to order
                    # order_item = OrderItem(order=order, menu_item=cart_item.menu_item, quantity=cart_item.quantity)
                    order_item = OrderItem(order_id=order.id, menu_item_id=cart_item.menu_item_id, quantity=cart_item.quantity)
                    all_order_items.append(order_item)

    db.session.add_all(all_orders)
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
