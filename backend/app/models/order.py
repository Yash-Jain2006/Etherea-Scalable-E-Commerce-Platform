from ..extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(30), nullable=False, default='pending') 
    # 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    shipping_fee = db.Column(db.Numeric(10, 2), nullable=False, default=50.00)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(30), nullable=False) # 'card' | 'upi' | 'cod'
    payment_status = db.Column(db.String(20), nullable=False, default='pending') # 'pending' | 'paid' | 'failed'
    shipping_address = db.Column(JSONB, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='orders')
    items = db.relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Order {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'status': self.status,
            'subtotal': float(self.subtotal),
            'shipping_fee': float(self.shipping_fee),
            'total': float(self.total),
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'shipping_address': self.shipping_address,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
