from wtforms import StringField, PasswordField, Form
from wtforms.validators import DataRequired, Length, Email, ValidationError
from wtforms.csrf.core import CSRFTokenField
from flask_wtf import FlaskForm
from flask_wtf.csrf import CSRFProtect
from app.models import User

# csrf = CSRFProtect()
def user_exists(form, field):
    # Checking if user exists
    email = field.data
    user = User.query.filter_by(email=email).first()
    if user:
        raise ValidationError('Email address is already in use.')

def username_exists(form, field):
    # Checking if username is already in use
    username = field.data
    user = User.query.filter_by(username=username).first()
    if user:
        raise ValidationError('Username is already in use.')

class SignUpForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired(), Length(max=255)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(max=255)])
    username = StringField('Username', validators=[DataRequired(), username_exists, Length(max=40)])
    email = StringField('Email', validators=[DataRequired(), Email(), user_exists, Length(max=255)])
    password = PasswordField('Password', validators=[DataRequired()])
