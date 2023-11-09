from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from ..helper_functions import format_review_date

class Order(db.Model):
    from .payment import Payment
    from .shipping import Shipping
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
    shipping_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('shippings.id')))
    payment_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('payments.id')))
    total_price = db.Column(db.Float)
    status = db.Column(db.String(50), default='Pending')
    delivery_time = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    is_deleted = db.Column(db.Boolean, default=False, nullable=False)

    # items = db.relationship("OrderItem", backref='order')
    items = db.relationship("OrderItem", backref='order', cascade="all, delete-orphan")

    shipping = db.relationship("Shipping", back_populates='order', uselist=False, foreign_keys=[Shipping.order_id])
    payment = db.relationship("Payment", back_populates='order', uselist=False, foreign_keys=[Payment.order_id])


    def to_dict(self):
        order_dict = {
            'id': self.id,
            'user_id': self.user_id,
            'shipping_id': self.shipping_id,
            'payment_id': self.payment_id,
            'total_price': self.total_price,
            'status': self.status,
            'delivery_time': self.delivery_time,
            'created_at': format_review_date(self.created_at),
            'updated_at': format_review_date(self.updated_at),
            'is_deleted': self.is_deleted,
        }
        print(f"Shipping: {self.shipping}")  # For debugging purposes
        print(f"Payment: {self.payment}")    # For debugging purposes
        # if self.shipping:
        #     order_dict['shippingAddress'] = f"{self.shipping.street_address}, {self.shipping.city}, {self.shipping.state}, {self.shipping.postal_code}, {self.shipping.country}"
        # if self.payment:
        #     order_dict['paymentStatus'] = self.payment.status
        # return order_dict
