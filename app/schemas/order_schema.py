from marshmallow import Schema, fields

class OrderSchema(Schema):
    id = fields.Int()
    user_id = fields.Int()
    total_price = fields.Float()
    status = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    
    items = fields.Nested('OrderItemSchema', many=True, exclude=('order',))
    payment = fields.Nested('PaymentSchema', exclude=('order',))
