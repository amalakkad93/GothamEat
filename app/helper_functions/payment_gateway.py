# payment_gateway.py
from enum import Enum

class PaymentGateway(Enum):
    STRIPE = "Stripe"
    PAYPAL = "PayPal"
    CREDIT_CARD = "Credit Card"
