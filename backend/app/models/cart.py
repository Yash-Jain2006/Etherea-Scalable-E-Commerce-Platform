from ..extensions import db
from datetime import datetime

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='uq_user_product'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='cart_items')
    product = db.relationship('Product', back_populates='cart_items')

    def __repr__(self):
        return f'<CartItem user_id={self.user_id} product_id={self.product_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'created_at': self.created_at.isoformat()
        }
