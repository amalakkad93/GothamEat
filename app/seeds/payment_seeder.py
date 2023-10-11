from random import choice, uniform
from ..models import db, Payment, Order, environment, SCHEMA
from sqlalchemy import text

def seed_payments():
    all_payments = []

    # Payment methods and statuses
    methods = ["Credit Card", "PayPal"]
    statuses = ["Completed", "Pending", "Failed"]

    # Get all completed orders
    orders = Order.query.filter_by(status="completed").all()

    for order in orders:
        #  Generate a random payment amount between 1 and 100
        amount = round(uniform(1.0, 100.0), 2)
        payment = Payment(
            order_id=order.id,
            gateway=choice(methods),
            status=choice(statuses),
            amount=amount
        )
        all_payments.append(payment)

    db.session.add_all(all_payments)
    db.session.commit()

def undo_payments():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.payments RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM payments"))
    db.session.commit()
