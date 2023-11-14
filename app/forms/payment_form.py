from wtforms import StringField, FloatField, SelectField, DateTimeField
from wtforms.validators import DataRequired, Length, NumberRange, Optional
from flask_wtf import FlaskForm


class PaymentForm(FlaskForm):
    gateway = SelectField('Payment Gateway', choices=[('Stripe', 'Stripe'), ('PayPal', 'PayPal'), ('Credit Card', 'Credit Card')], validators=[DataRequired()])
    # stripe_payment_intent_id = StringField('Stripe Payment Intent ID', validators=[Length(max=255)])
    # stripe_payment_method_id = StringField('Stripe Payment Method ID', validators=[Length(max=255)])
    # paypal_transaction_id = StringField('PayPal Transaction ID', validators=[Length(max=255)])
    cardholder_name = StringField('Cardholder Name', validators=[Optional(), Length(max=255)])
    card_number = StringField('Card Number', validators=[Optional(), Length(min=5, max=16)])
    card_expiry_month = StringField('Card Expiry Month', validators=[Optional(), Length(min=2, max=2)])
    card_expiry_year = StringField('Card Expiry Year', validators=[Optional(), Length(min=2, max=4)])
    card_cvc = StringField('Card CVC', validators=[Optional(), Length(min=3, max=4)])
    postal_code = StringField('Postal Code', validators=[Optional(), Length(min=5, max=5)])
    amount = FloatField('Amount', validators=[DataRequired(), NumberRange(min=0)])
    status = SelectField('Status', choices=[('Pending', 'Pending'), ('Completed', 'Completed'), ('Failed', 'Failed')], default='Pending')
