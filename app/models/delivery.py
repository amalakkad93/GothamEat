from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Delivery(db.Model):
    __tablename__ = 'deliveries'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    # order_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('orders.id')))
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    # order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))

    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))

    street_address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(100))

    # shipping_type = db.Column(db.String(50))
    cost = db.Column(db.Float)
    status = db.Column(db.String(50), default='Pending')

    tracking_number = db.Column(db.String(255))
    shipped_at = db.Column(db.DateTime)
    estimated_delivery = db.Column(db.DateTime)

    # order = db.relationship('Order', backref=db.backref('delivery', uselist=False, lazy=True))
    user = db.relationship('User', backref=db.backref('deliveries', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'user_id': self.user_id,
            'street_address': self.street_address,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'country': self.country,
            'cost': self.cost,
            'status': self.status,
            'tracking_number': self.tracking_number,
            'shipped_at': self.shipped_at.isoformat() if self.shipped_at else None,
            'estimated_delivery': self.estimated_delivery.isoformat() if self.estimated_delivery else None,
        }
