from marshmallow import Schema, fields

class PaymentSchema(Schema):
    id = fields.Int()
    order_id = fields.Int()
    gateway = fields.Str()
    stripe_payment_intent_id = fields.Str()
    stripe_payment_method_id = fields.Str()
    paypal_transaction_id = fields.Str()
    amount = fields.Float()
    status = fields.Str()
