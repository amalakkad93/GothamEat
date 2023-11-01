from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from ..helper_functions import format_review_date

class Order(db.Model):
    __tablename__ = 'orders'
    def add_prefix_for_prod(attr):
        if environment == "production":
            return f"{SCHEMA}.{attr}"
        else:
            return attr
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    total_price = db.Column(db.Float)
    status = db.Column(db.String(50), default='Pending')
    delivery_time = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # items = db.relationship("OrderItem", backref='order')
    items = db.relationship("OrderItem", backref='order', cascade="all, delete-orphan")

    payment = db.relationship("Payment", backref="order", uselist=False, lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_price': self.total_price,
            'status': self.status,
            'delivery_time': self.delivery_time,
            'created_at': format_review_date(self.created_at),
            'updated_at': format_review_date(self.updated_at),
            # 'orderItems': [item.to_dict() for item in self.items]
        }
