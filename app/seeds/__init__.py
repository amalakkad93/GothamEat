from flask.cli import AppGroup
from .users_seeder import seed_users, undo_users
from .favorite_seeder import seed_favorites, undo_favorites
from .restaurant_seeder import seed_restaurants, undo_restaurants
from .menu_item_seeder import seed_menu_items, undo_menu_items
from .review_seeder import seed_reviews, undo_reviews
from .review_img_seeder import seed_review_images, undo_review_images
from .shopping_cart_seeder import seed_shopping_carts_and_items, undo_shopping_carts_and_items
from .order_seeder import seed_orders_and_order_items, undo_orders_and_order_items
# from .payment_seeder import seed_payments, undo_payments
from app.models.db import db, environment, SCHEMA

# Creates a seed group to hold our commands
# So we can type `flask seed --help`
seed_commands = AppGroup('seed')


# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    if environment == 'production':
        # Before seeding in production, you want to run the seed undo
        # command, which will  truncate all tables prefixed with
        # the schema name (see comment in users.py undo_users function).
        # Make sure to add all your other model's undo functions below
        undo_users()
    seed_users()
    seed_restaurants()
    seed_menu_items()
    seed_favorites()
    seed_reviews()
    seed_review_images()
    seed_shopping_carts_and_items()
    seed_orders_and_order_items()
    # seed_payments()

# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    # undo_payments()
    undo_orders_and_order_items()
    undo_shopping_carts_and_items()
    undo_review_images()
    undo_reviews()
    undo_favorites()
    undo_menu_items()
    undo_restaurants()
    undo_users()
    # Add other undo functions here
