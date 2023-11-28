from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from sqlalchemy import func
from .db import db, environment, SCHEMA, add_prefix_for_prod
from .restaurant import Restaurant

class Favorite(db.Model):
    __tablename__ = 'favorites'
    def add_prefix_for_prod(attr):
        if environment == "production":
            return f"{SCHEMA}.{attr}"
        else:
            return attr

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'))
    restaurant_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('restaurants.id')))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # user = db.relationship('User', backref=db.backref('favorites', lazy=True, cascade='all, delete-orphan'))
    restaurant = db.relationship('Restaurant', backref=db.backref('favorited_by', lazy=True, cascade='all, delete-orphan'))

    # # this to make sure a user can't favorite the same restaurant multiple times
    # __table_args__ = (db.UniqueConstraint('user_id', 'restaurant_id', name='unique_user_restaurant'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'restaurant_id': self.restaurant_id,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
