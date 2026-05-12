from ..extensions import db
from datetime import datetime

class Review(db.Model):
    __tablename__ = 'reviews'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='uq_user_product_review'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('reviews', cascade='all, delete-orphan'))
    product = db.relationship('Product', backref=db.backref('reviews', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else 'Anonymous',
            'product_id': self.product_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }
