from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, TimeField, FileField, SubmitField, IntegerField
from wtforms.validators import DataRequired, Length, URL, Optional

class ReviewForm(FlaskForm):
    review = TextAreaField('Review', validators=[DataRequired()])
    stars = IntegerField('Rating', validators=[DataRequired()])
    submit = SubmitField("Post Review")
