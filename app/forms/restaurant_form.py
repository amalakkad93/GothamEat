from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, TimeField, FileField, SubmitField, FloatField
from wtforms.validators import DataRequired, Length, URL, Optional, ValidationError

def validate_latitude(form, field):
    if field.data:
        if not (-90 <= field.data <= 90):
            raise ValidationError('Latitude must be between -90 and 90.')

def validate_longitude(form, field):
    if field.data:
        if not (-180 <= field.data <= 180):
            raise ValidationError('Longitude must be between -180 and 180.')


class RestaurantForm(FlaskForm):
    name = StringField('Restaurant Name', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', validators=[DataRequired()])
    banner_image_path = StringField('Banner Image URL', validators=[Optional(), URL(), Length(max=500)])
    street_address = StringField('Street Address', validators=[DataRequired(), Length(max=255)])
    city = StringField('City', validators=[DataRequired(), Length(max=100)])
    state = StringField('State', validators=[DataRequired(), Length(max=100)])
    country = StringField('Country', validators=[DataRequired(), Length(max=100)])
    latitude = FloatField('Latitude', validators=[Optional(), validate_latitude])
    longitude = FloatField('Longitude', validators=[Optional(), validate_longitude])
    postal_code = StringField('Postal Code', validators=[DataRequired(), Length(max=20)])
    opening_time = TimeField('Opening Time', format='%H:%M', validators=[DataRequired()])
    closing_time = TimeField('Closing Time', format='%H:%M', validators=[DataRequired()])
    submit = SubmitField("Create Restaurant")
