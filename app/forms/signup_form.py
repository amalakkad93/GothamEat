from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField
from wtforms.validators import DataRequired, Length, Email, ValidationError, NumberRange
from app.models import User


def user_exists(form, field):
    # Checking if user exists
    email = field.data
    user = User.query.filter(User.email == email).first()
    if user:
        raise ValidationError('Email address is already in use.')


def username_exists(form, field):
    # Checking if username is already in use
    username = field.data
    user = User.query.filter(User.username == username).first()
    if user:
        raise ValidationError('Username is already in use.')


class SignUpForm(FlaskForm):
    first_name = StringField('first_name', validators=[DataRequired(), Length(max=255)])
    last_name = StringField('last_name', validators=[DataRequired(), Length(max=255)])
    username = StringField('username', validators=[DataRequired(), username_exists, Length(max=40)])
    email = StringField('email', validators=[DataRequired(), Email(), user_exists, Length(max=255)])
    password = StringField('password', validators=[DataRequired()])
    street_address = StringField('street_address', validators=[DataRequired(), Length(max=255)])
    city = StringField('city', validators=[DataRequired(), Length(max=255)])
    state = StringField('state', validators=[DataRequired(), Length(max=50)])
    postal_code = IntegerField('postal_code', validators=[DataRequired(), NumberRange(min=10000, max=99999)])
    country = StringField('country', validators=[DataRequired(), Length(max=50)])
    phone = StringField('phone', validators=[DataRequired(), Length(max=20)])
