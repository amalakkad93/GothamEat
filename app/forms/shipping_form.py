from typing import Optional
from wtforms import StringField, FloatField, SelectField, FormField, DateTimeField
from wtforms.validators import DataRequired, Length, NumberRange
from flask_wtf import FlaskForm

class ShippingForm(FlaskForm):
    street_address = StringField('Street Address', validators=[DataRequired(), Length(max=255)])
    city = StringField('City', validators=[DataRequired(), Length(max=100)])
    state = StringField('State', validators=[DataRequired(), Length(max=100)])
    postal_code = StringField('Postal Code', validators=[DataRequired(), Length(max=20)])
    country = StringField('Country', validators=[DataRequired(), Length(max=100)])
    # shipping_type = StringField('Shipping Type', validators=[DataRequired(), Length(max=50)])
    cost = FloatField('Cost', validators=[DataRequired(), NumberRange(min=0)])
    status = SelectField('Status', choices=[('Pending', 'Pending'), ('Shipped', 'Shipped'), ('Delivered', 'Delivered')], default='Pending')
    # tracking_number = StringField('Tracking Number', validators=[Optional()])
    # shipped_at = DateTimeField('Shipped At')
    # estimated_delivery = DateTimeField('Estimated Delivery')
