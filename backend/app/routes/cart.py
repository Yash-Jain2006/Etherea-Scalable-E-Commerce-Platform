from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..extensions import db
from ..models.cart import CartItem
from ..models.product import Product
from ..utils.errors import error_response

cart_bp = Blueprint('cart', __name__, url_prefix='/api/v1/cart')

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    
    items_data = []
    subtotal = 0
    
    for item in cart_items:
        product = item.product
        item_subtotal = float(product.price) * item.quantity
        subtotal += item_subtotal
        
        items_data.append({
            "product_id": product.id,
            "name": product.name,
            "price": float(product.price),
            "image_url": product.image_url,
            "quantity": item.quantity,
            "subtotal": item_subtotal,
            "stock_available": product.stock_quantity
        })
        
    shipping_fee = 50.00 if subtotal > 0 else 0.00
    total = subtotal + shipping_fee
    
    return jsonify({
        "success": True,
        "data": {
            "items": items_data,
            "subtotal": round(subtotal, 2),
            "shipping_fee": shipping_fee,
            "total": round(total, 2)
        }
    })

@cart_bp.route('', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return error_response("MISSING_PRODUCT_ID", "Product ID is required", 400)
        
    product = Product.query.get_or_404(product_id)
    
    if not product.is_active:
        return error_response("PRODUCT_INACTIVE", "This product is no longer available", 400)
        
    if product.stock_quantity < quantity:
        return error_response("INSUFFICIENT_STOCK", f"Only {product.stock_quantity} units available", 400)

    # Check if item already exists in cart
    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    
    if cart_item:
        new_quantity = cart_item.quantity + quantity
        if product.stock_quantity < new_quantity:
             return error_response("INSUFFICIENT_STOCK", "Adding this quantity exceeds available stock", 400)
        cart_item.quantity = new_quantity
    else:
        cart_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)
        
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Item added to cart",
        "data": {"cart_item": cart_item.to_dict()}
    })

@cart_bp.route('/items/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(product_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    quantity = data.get('quantity')
    
    if quantity is None or quantity < 1:
        return error_response("INVALID_QUANTITY", "Quantity must be at least 1", 400)
        
    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first_or_404()
    product = Product.query.get(product_id)
    
    if product.stock_quantity < quantity:
        return error_response("INSUFFICIENT_STOCK", f"Only {product.stock_quantity} units available", 400)
        
    cart_item.quantity = quantity
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Cart updated",
        "data": {"cart_item": cart_item.to_dict()}
    })

@cart_bp.route('/items/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(product_id):
    user_id = get_jwt_identity()
    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first_or_404()
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Item removed from cart"
    })

@cart_bp.route('', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = get_jwt_identity()
    CartItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Cart cleared"
    })
