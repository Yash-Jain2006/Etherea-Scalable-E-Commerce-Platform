from ..extensions import db

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    product_image = db.Column(db.String(500), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    # Relationships
    order = db.relationship('Order', back_populates='items')
    # Product relationship implies direct link to current product state,
    # but the snapshot (name, unit_price) ensures order history is immutable.
    product = db.relationship('Product')

    def __repr__(self):
        return f'<OrderItem order_id={self.order_id} product_id={self.product_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_image': self.product_image,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'subtotal': float(self.subtotal)
        }
