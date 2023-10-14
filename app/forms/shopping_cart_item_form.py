from flask_wtf import FlaskForm
from wtforms import IntegerField, ValidationError
from wtforms.validators import DataRequired, Optional
from ..models import MenuItem

class ShoppingCartItemForm(FlaskForm):
    menu_item_id = IntegerField('menu_item_id', validators=[Optional(), DataRequired()])
    quantity = IntegerField('quantity', validators=[DataRequired()])

    def validate_quantity(self, quantity):
        if quantity.data < 1:
            raise ValidationError('Quantity must be at least 1.')

    def validate_menu_item_id(self, menu_item_id):
        item = MenuItem.query.get(menu_item_id.data)
        if not item:
            raise ValidationError('Invalid menu_item_id. This item does not exist.')
