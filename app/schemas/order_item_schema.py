from marshmallow import Schema, fields

class OrderItemSchema(Schema):
    id = fields.Int()
    menu_item_id = fields.Int()
    order_id = fields.Int()
    quantity = fields.Int()
