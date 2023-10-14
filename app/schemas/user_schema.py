from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Int()
    first_name = fields.Str()
    last_name = fields.Str()
    username = fields.Str()
    email = fields.Str()
    
    restaurants = fields.Nested('RestaurantSchema', many=True, exclude=('owner',))
    reviews = fields.Nested('ReviewSchema', many=True, exclude=('user',))
    shopping_cart = fields.Nested('ShoppingCartSchema', exclude=('user',))
