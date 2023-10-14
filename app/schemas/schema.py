from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from sqlalchemy import func
from marshmallow import Schema, fields
from ..models import Review, User, Review, ReviewImg, MenuItem, MenuItemImg, Order, OrderItem, ShoppingCart, ShoppingCartItem, Favorite, Payment, db, environment, SCHEMA, add_prefix_for_prod

class RestaurantSchema(Schema):
    class Meta:
        model = Review

class UserSchema(Schema):
    class Meta:
        model = User

class ReviewSchema(Schema):
    class Meta:
        model = Review

class MenuItemSchema(Schema):
    class Meta:
        model = MenuItem

class MenuItemImgSchema(Schema):
    class Meta:
        model = MenuItemImg

class OrderSchema(Schema):
    class Meta:
        model = Order

class OrderItemSchema(Schema):
    class Meta:
        model = OrderItem

class ShoppingCartSchema(Schema):
    class Meta:
        model = ShoppingCart

class ShoppingCartItemSchema(Schema):
    class Meta:
        model = ShoppingCartItem

class FavoriteSchema(Schema):
    class Meta:
        model = Favorite

class PaymentSchema(Schema):
    class Meta:
        model = Payment




# Optionally, you can customize the schema fields
# by including or excluding specific fields, like this:

class CustomUserSchema(Schema):
    class Meta:
        model = User
        # Exclude the hashed_password field for security reasons
        exclude = ("hashed_password",)

# You can also nest schemas to include related data

class ReviewSchemaWithUser(Schema):
    class Meta:
        model = Review

    user = fields.Nested(UserSchema)

class ReviewSchemaWithRestaurant(Schema):
    class Meta:
        model = Review

    restaurant = fields.Nested(RestaurantSchema)

# Similarly, you can create custom schemas for your specific needs
