from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
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

    # menu_items = db.relationship('MenuItem', backref='restaurant', lazy='dynamic', cascade="all, delete-orphan")
    # reviews = db.relationship('Review', backref='restaurant', lazy='dynamic')

    # user = db.relationship("User", back_populates="restaurants")
    # reviews = db.relationship("Review", back_populates="restaurant")
    # menu_items = db.relationship('MenuItem', back_populates='restaurant', cascade="all, delete-orphan", single_parent=True)

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
            'closing_time': self.closing_time.strftime('%H:%M')
        }
