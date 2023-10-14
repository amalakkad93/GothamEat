from marshmallow import Schema, fields

class ReviewImgSchema(Schema):
    id = fields.Int()
    review_id = fields.Int()
    image_path = fields.Str()
