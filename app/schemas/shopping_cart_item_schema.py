from marshmallow import Schema, fields

class ShoppingCartItemSchema(Schema):
    id = fields.Int()
    menu_item_id = fields.Int()
    shopping_cart_id = fields.Int()
    quantity = fields.Int()
