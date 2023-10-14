from flask_wtf import FlaskForm
from wtforms import IntegerField
from wtforms.validators import DataRequired, NumberRange

class OrderItemForm(FlaskForm):
    menu_item_id = IntegerField('Menu Item ID', validators=[
        DataRequired(message="Menu item ID is required.")
    ])
    quantity = IntegerField('Quantity', validators=[
        DataRequired(message="Quantity is required."),
        NumberRange(min=1, message="Quantity should be at least 1.")
    ])
