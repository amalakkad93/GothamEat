from marshmallow import Schema, fields

class MenuItemImgSchema(Schema):
    id = fields.Int()
    menu_item_id = fields.Int()
    image_path = fields.Str()
    menu_item = fields.Nested('MenuItemSchema', exclude=('menu_item_imgs',)) 
