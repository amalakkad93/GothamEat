from marshmallow import Schema, fields

class ReviewSchema(Schema):
    id = fields.Int()
    user_id = fields.Int()
    restaurant_id = fields.Int()
    review = fields.Str()
    stars = fields.Int()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    restaurant = fields.Nested('RestaurantSchema', exclude=('reviews',)) # Add this line

