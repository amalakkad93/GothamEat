from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import func

class ShoppingCart(db.Model):
    __tablename__ = 'shopping_carts'

    def add_prefix_for_prod(attr):
        if environment == "production":
            return f"{SCHEMA}.{attr}"
        else:
            return attr
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))

    items = db.relationship("ShoppingCartItem", backref='cart', cascade="all, delete-orphan")


    def calculate_total_price(self):
        # This method calculates the total price of all items in the shopping cart.

        # Check if the items relationship is a dynamic loader, if so, load all items.
        # This is to ensure that we're working with the actual list of items
        # and not an unloaded SQL query or relationship.
        items = self.items.all() if hasattr(self.items, 'all') else self.items

        # Compute the total price by iterating over each item in the cart.
        # We use a generator expression to sum up the price multiplied by the quantity.
        # The 'or 0' part ensures that if either the price or quantity is None (which shouldn't happen),
        # it is treated as 0 to avoid type errors during the calculation.
        total_price = sum((item.menu_item.price or 0) * (item.quantity or 0) for item in items if item.menu_item and item.quantity is not None)

        # The total price is rounded to 2 decimal places before being returned.
        # This is a common practice when dealing with currency to avoid
        # floating-point arithmetic issues and to ensure the price is in a standard currency format.
        return round(total_price, 2)


    def to_dict(self):
        return {
           'id': self.id,
           'user_id': self.user_id,
           'total_price': self.calculate_total_price(),
        }
