from .db import db, environment, SCHEMA, add_prefix_for_prod
from sqlalchemy import Enum, String, Integer, Float, Column
from .. import helper_functions as hf
from ..helper_functions import PaymentGateway

# Define an Enum for the payment gateways
# class PaymentGateway(Enum):
#     STRIPE = "Stripe"
#     PAYPAL = "PayPal"
#     CREDIT_CARD = "Credit Card"

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
    # order_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('orders.id')))
    # order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))


    # gateway = db.Column(Enum("Stripe", "PayPal", "Credit Card", name="payment_gateways"))
    # gateway = db.Column(Enum(PaymentGateway.STRIPE, PaymentGateway.PAYPAL, PaymentGateway.CREDIT_CARD, name="payment_gateways"))
    # gateway = db.Column(db.Enum(PaymentGateway))
    gateway = db.Column(db.String(255))

    stripe_payment_intent_id = db.Column(db.String(255))
    stripe_payment_method_id = db.Column(db.String(255))

    paypal_transaction_id = db.Column(db.String(255))

    cardholder_name = db.Column(db.String(255))
    card_number = db.Column(db.String(16))
    card_expiry_month = db.Column(db.String(2))
    card_expiry_year = db.Column(db.String(4))
    card_cvc = db.Column(db.String(4))
    postal_code = db.Column(db.String(20))
    amount = db.Column(db.Float)
    status = db.Column(db.String(255), default="Pending")

    # order = db.relationship('Order', backref=db.backref('delivery', uselist=False, lazy=True))
    # order = db.relationship('Order', backref=db.backref('payment', uselist=False, lazy=True))
    def to_dict(self):
        data = {
            "id": self.id,
            # "order_id": self.order_id,
            "gateway": self.gateway,
            "amount": self.amount,
            "status": self.status
        }

        if self.gateway == "Stripe":
            data.update({
                "stripe_payment_intent_id": self.stripe_payment_intent_id,
                "stripe_payment_method_id": self.stripe_payment_method_id
            })
        elif self.gateway == "PayPal":
            data.update({
                "paypal_transaction_id": self.paypal_transaction_id
            })
        elif self.gateway == "Credit Card":
            # Reminder: Never store raw credit card details in the database in production
            data.update({
                "cardholder_name": self.cardholder_name,
                "card_number": self.card_number,
                "card_expiry_month": self.card_expiry_month,
                "card_expiry_year": self.card_expiry_year,
                "card_cvc": self.card_cvc,
                "postal_code": self.postal_code
            })
        return data
