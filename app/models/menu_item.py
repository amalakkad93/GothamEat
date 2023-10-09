from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime
from .menu_item_img import MenuItemImg
from .shopping_cart_item import ShoppingCartItem

class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    def add_prefix_for_prod(attr):
        if environment == "production":
            return f"{SCHEMA}.{attr}"
        else:
            return attr

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('restaurants.id')))
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float)

    menu_item_imgs = db.relationship('MenuItemImg', backref='menu_item', cascade="all, delete-orphan")
    cart_items = db.relationship('ShoppingCartItem', backref='menu_item')
    
    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'price': self.price
        }
