from random import randint, choice
from sqlalchemy import text
from ..models import db, User, MenuItem, MenuItemImg, Order, OrderItem, ShoppingCartItem, ShoppingCart, environment, SCHEMA




def seed_shopping_carts_and_items():
    all_carts = []
    all_cart_items = []
    users = User.query.all()
    all_menu_items = MenuItem.query.all()

    for user in users:
        # Create a shopping cart for each user
        cart = ShoppingCart(user_id=user.id)
        all_carts.append(cart)

        # Create random cart items for the cart
        for _ in range(randint(1, 5)):  # Random number of items for variation
            menu_item = choice(all_menu_items)  # Random menu item
            quantity = randint(1, 3)  # Random quantity
            cart_item = ShoppingCartItem(cart=cart, menu_item=menu_item, quantity=quantity)
            cart_items = ShoppingCartItem.query.filter_by(shopping_cart_id=user.shopping_cart.id).all()




            all_cart_items.append(cart_item)

    db.session.add_all(all_carts)
    db.session.add_all(all_cart_items)
    db.session.commit()

def undo_shopping_carts_and_items():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.shopping_cart_items RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.shopping_carts RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM shopping_cart_items"))
        db.session.execute(text("DELETE FROM shopping_carts"))
    db.session.commit()
