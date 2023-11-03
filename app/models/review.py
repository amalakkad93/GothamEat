from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime, timezone
from sqlalchemy import func
from .review_img import ReviewImg
from ..helper_functions import format_review_date

class Review(db.Model):
    __tablename__ = 'reviews'
    def add_prefix_for_prod(attr):
        if environment == "production":
            return f"{SCHEMA}.{attr}"
        else:
            return attr
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    restaurant_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('restaurants.id')))
    review = db.Column(db.Text)
    stars = db.Column(db.Integer)
    # created_at = db.Column(db.DateTime, default=datetime.now)
    # updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    review_imgs = db.relationship('ReviewImg', backref='review', cascade="all, delete-orphan")


    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'user_id': self.user_id,
            'review': self.review,
            'stars': self.stars,
            'created_at': self.created_at.isoformat(),
            'created_at_display': format_review_date(self.created_at),
            'updated_at': format_review_date(self.updated_at),
        }
