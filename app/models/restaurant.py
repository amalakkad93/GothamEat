from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from sqlalchemy import func
from .db import db, environment, SCHEMA, add_prefix_for_prod
from .review import Review
from .menu_item import MenuItem

class Restaurant(db.Model):

    __tablename__ = 'restaurants'
    def add_prefix_for_prod(attr):
        if environment == "production":
            return f"{SCHEMA}.{attr}"
        else:
            return attr
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    banner_image_path = db.Column(db.String(500))
    street_address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(100))
    name = db.Column(db.String(100))
    description = db.Column(db.Text)


    opening_time = db.Column(db.Time)
    closing_time = db.Column(db.Time)

    menu_items = db.relationship('MenuItem', backref='restaurant', lazy=True, cascade="all, delete-orphan")
    reviews = db.relationship('Review', backref='restaurant', lazy=True)

    # @property
    # def avg_rating(self):
    #     total_stars = 0
    #     all_reviews = db.session.query(Review).filter(Review.restaurant_id == self.id).all()
    #     for review in all_reviews:
    #         total_stars += review.stars
    #     average_rating = round(total_stars / len(all_reviews), 1) if all_reviews else 0
    #     return average_rating

    # or

    @property
    def avg_rating(self):
        average_rating = db.session.query(func.avg(Review.stars)).filter(Review.restaurant_id == self.id).scalar()
        return round(average_rating, 1) if average_rating is not None else 0

    def to_dict(self):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'name': self.name,
            'description': self.description,
            'banner_image_path': self.banner_image_path,
            'street_address': self.street_address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'opening_time': self.opening_time.strftime('%H:%M'),
            'closing_time': self.closing_time.strftime('%H:%M'),
            'average_rating': self.avg_rating
        }
