from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, TimeField, FileField, SubmitField
from wtforms.validators import DataRequired, Length, URL, Optional

class RestaurantForm(FlaskForm):
    name = StringField('Restaurant Name', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', validators=[DataRequired()])
    banner_image_path = StringField('Banner Image URL', validators=[Optional(), URL(), Length(max=500)])
    street_address = StringField('Street Address', validators=[DataRequired(), Length(max=255)])
    city = StringField('City', validators=[DataRequired(), Length(max=100)])
    state = StringField('State', validators=[DataRequired(), Length(max=100)])
    country = StringField('Country', validators=[DataRequired(), Length(max=100)])
    postal_code = StringField('Postal Code', validators=[DataRequired(), Length(max=20)])
    opening_time = TimeField('Opening Time', format='%H:%M', validators=[DataRequired()])
    closing_time = TimeField('Closing Time', format='%H:%M', validators=[DataRequired()])
    submit = SubmitField("Create Restaurant")
