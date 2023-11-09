# Function to get the PaymentGateway enum from string

def get_payment_gateway_enum(gateway_str):
    from ..models import PaymentGateway
    gateway_str = gateway_str.lower()
    if gateway_str == "stripe":
        return PaymentGateway.STRIPE
    elif gateway_str == "paypal":
        return PaymentGateway.PAYPAL
    elif gateway_str == "credit card":
        return PaymentGateway.CREDIT_CARD
    else:
        raise ValueError(f"Invalid payment gateway: {gateway_str}")
