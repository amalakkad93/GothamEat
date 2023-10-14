from flask_wtf import FlaskForm
from wtforms import FloatField, StringField
from wtforms.validators import DataRequired, AnyOf

class OrderForm(FlaskForm):
    total_price = FloatField('Total Price', validators=[DataRequired(message="Total price is required.")])
    status = StringField('Status', validators=[
        DataRequired(message="Status is required."),
        AnyOf(values=['Pending', 'Completed', 'Cancelled', 'Processing'], message="Invalid status.")
    ])
