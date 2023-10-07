

from flask_wtf import FlaskForm
from wtforms import StringField, FloatField, IntegerField, SelectField, SubmitField, TextAreaField
from wtforms.validators import DataRequired


class MenuItemForm(FlaskForm):
    # class Meta:
    #  csrf = False
    name = StringField('Name', validators=[DataRequired()])
    description = TextAreaField("Description", validators=[DataRequired()])
    type = SelectField('Type', choices=['entree', 'dessert', 'drink', 'side'], validators=[DataRequired()])
    price = FloatField('Price', validators=[DataRequired()])
    submit = SubmitField("Add Menu Item")
    # type = SelectField('Type', choices=[('entree', 'Entree'), ('dessert', 'Dessert'), ('drink', 'Drink'), ('side', 'Side')], validators=[DataRequired()])
