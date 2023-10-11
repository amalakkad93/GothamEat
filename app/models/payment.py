from .db import db, environment, SCHEMA, add_prefix_for_prod
from sqlalchemy import Enum


class Payment(db.Model):
    __tablename__ = 'payments'
    def add_prefix_for_prod(attr):
        if environment == "production":
            return f"{SCHEMA}.{attr}"
        else:
            return attr
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('orders.id')))
    gateway = db.Column(Enum("Stripe", "PayPal", name="payment_gateways"))
    stripe_payment_intent_id = db.Column(db.String(255))
    stripe_payment_method_id = db.Column(db.String(255))
    paypal_transaction_id = db.Column(db.String(255))
    amount = db.Column(db.Float)
    status = db.Column(db.String(255), default="Pending")

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "gateway": self.gateway,
            "stripe_payment_intent_id": self.stripe_payment_intent_id,
            "stripe_payment_method_id": self.stripe_payment_method_id,
            "paypal_transaction_id": self.paypal_transaction_id,
            "amount": self.amount,
            "status": self.status
        }
