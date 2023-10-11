from flask_wtf import FlaskForm
from wtforms import FileField, IntegerField, StringField, SubmitField
from wtforms.validators import DataRequired, URL, Optional, Length

from ..s3 import ALLOWED_EXTENSIONS

class MenuItemImgForm(FlaskForm):
    image = FileField("Upload Image")
    image_url = StringField('Image URL', validators=[Optional(), URL(), Length(max=500)])
    submit = SubmitField("Submit")
