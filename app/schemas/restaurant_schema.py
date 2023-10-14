from marshmallow import Schema, fields

class RestaurantSchema(Schema):
    id = fields.Int()
    owner_id = fields.Int()
    banner_image_path = fields.Str()
    street_address = fields.Str()
    city = fields.Str()
    state = fields.Str()
    postal_code = fields.Str()
    country = fields.Str()
    name = fields.Str()
    description = fields.Str()
    opening_time = fields.Time()
    closing_time = fields.Time()
    average_rating = fields.Float()
    
    menu_items = fields.Nested('MenuItemSchema', many=True, exclude=('restaurant',))
    reviews = fields.Nested('ReviewSchema', many=True, exclude=('restaurant',))

    def get_average_rating(self, obj):
        return obj.average_rating
