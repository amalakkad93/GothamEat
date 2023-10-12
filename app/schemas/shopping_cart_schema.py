from marshmallow import Schema, fields

class ShoppingCartSchema(Schema):
    id = fields.Int()
    user_id = fields.Int()
    
    items = fields.Nested('ShoppingCartItemSchema', many=True, exclude=('cart',))
