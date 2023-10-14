from marshmallow import Schema, fields
from .menu_item_img_schema import MenuItemImgSchema

class MenuItemSchema(Schema):
    id = fields.Int()
    restaurant_id = fields.Int()
    name = fields.Str()
    description = fields.Str()
    type = fields.Str()
    price = fields.Float()
    menu_item_imgs = fields.Nested(MenuItemImgSchema, many=True)

    # menu_item_imgs = fields.Nested('MenuItemImgSchema', many=True, exclude=('menu_item',))
    # restaurant = fields.Nested('RestaurantSchema', exclude=('menu_items',)) 
