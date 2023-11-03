from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class ReviewImg(db.Model):
    __tablename__ = 'review_imgs'

    def add_prefix_for_prod(attr):
        if environment == "production":
            return f"{SCHEMA}.{attr}"
        else:
            return attr

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    # review_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('reviews.id')))
    review_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('reviews.id'), ondelete='CASCADE'))
    
    image_path = db.Column(db.String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'review_id': self.review_id,
            'image_path': self.image_path
        }
