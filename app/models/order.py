from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from ..helper_functions import format_review_date
# from .payment import Payment
# from .delivery import Delivery

class Order(db.Model):
    __tablename__ = 'orders'
    def add_prefix_for_prod(attr):
        
        schema = f"{SCHEMA}.{attr}" if environment == "production" else attr
        current_app.logger.info(f"Schema being used for {attr}: {schema}")
        return schema

        # if environment == "production":
        #     return f"{SCHEMA}.{attr}"
        # else:
        #     return attr
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    delivery_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('deliveries.id')), nullable=True)
    payment_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('payments.id')), nullable=True)

    total_price = db.Column(db.Float)
    status = db.Column(db.String(50), default='Pending')
    delivery_time = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    is_deleted = db.Column(db.Boolean, default=False, nullable=False)

    items = db.relationship("OrderItem", backref='order', cascade="all, delete-orphan")
    delivery = db.relationship('Delivery', backref=db.backref('order', uselist=False, lazy=True), foreign_keys=[delivery_id])
    payment = db.relationship('Payment', backref=db.backref('order', uselist=False, lazy=True), foreign_keys=[payment_id])


    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'delivery_id': self.delivery_id,
            'payment_id': self.payment_id,
            'total_price': self.total_price,
            'status': self.status,
            'delivery_time': self.delivery_time,
            'created_at': format_review_date(self.created_at),
            'updated_at': format_review_date(self.updated_at),
            'is_deleted': self.is_deleted,
            'delivery': self.delivery.to_dict() if self.delivery else None,
            'payment': self.payment.to_dict() if self.payment else None,
        }
