from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..extensions import db
from ..models.wishlist import Wishlist
from ..models.product import Product

wishlist_bp = Blueprint('wishlist', __name__, url_prefix='/api/v1/wishlist')

@wishlist_bp.route('', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        "success": True,
        "data": {
            "wishlist": [item.to_dict() for item in wishlist_items]
        }
    })

@wishlist_bp.route('/<int:product_id>', methods=['POST'])
@jwt_required()
def add_to_wishlist(product_id):
    user_id = get_jwt_identity()
    
    # Check if product exists
    Product.query.get_or_404(product_id)
    
    # Check if already in wishlist
    existing = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        return jsonify({
            "success": False,
            "message": "Product is already in your wishlist"
        }), 400
        
    wishlist_item = Wishlist(user_id=user_id, product_id=product_id)
    db.session.add(wishlist_item)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Added to wishlist",
        "data": {"item": wishlist_item.to_dict()}
    }), 201

@wishlist_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(product_id):
    user_id = get_jwt_identity()
    
    wishlist_item = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first_or_404()
    
    db.session.delete(wishlist_item)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Removed from wishlist"
    })
