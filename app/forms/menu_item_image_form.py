from flask_wtf import FlaskForm
from wtforms import IntegerField, StringField
from wtforms.validators import DataRequired, URL, Optional, Length

class MenuItemImgForm(FlaskForm):
    image_path = StringField('Image Path', validators=[Optional(), URL(), Length(max=500)])
