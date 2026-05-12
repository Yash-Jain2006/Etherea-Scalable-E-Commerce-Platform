from ..extensions import db
from datetime import datetime

class Wishlist(db.Model):
    __tablename__ = 'wishlists'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='uq_wishlist_user_product'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('wishlist_items', cascade='all, delete-orphan'))
    product = db.relationship('Product')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product': self.product.to_dict() if self.product else None,
            'created_at': self.created_at.isoformat()
        }
