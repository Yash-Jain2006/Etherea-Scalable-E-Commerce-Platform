from flask import Blueprint, request, jsonify
from sqlalchemy import or_
import math

from ..extensions import db
from ..models.product import Product
from ..models.category import Category
from ..schemas.product_schema import ProductSchema, CategorySchema
from ..utils.decorators import admin_required
from ..utils.errors import error_response, validation_error

products_bp = Blueprint('products', __name__, url_prefix='/api/v1/products')
categories_bp = Blueprint('categories', __name__, url_prefix='/api/v1/categories')

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)
category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)

# --- Category Routes ---

@categories_bp.route('', methods=['GET'])
def list_categories():
    categories = Category.query.all()
    return jsonify({
        "success": True,
        "data": {"categories": categories_schema.dump(categories)}
    })

# --- Product Routes ---

@products_bp.route('', methods=['GET'])
def list_products():
    # Query Params
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category_slug = request.args.get('category')
    search = request.args.get('search')
    sort = request.args.get('sort', 'newest') # price_asc | price_desc | newest

    query = Product.query.filter_by(is_active=True)

    # Filtering
    if category_slug:
        category = Category.query.filter_by(slug=category_slug).first()
        if category:
            query = query.filter_by(category_id=category.id)

    # Search (ILIKE on name and description)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(or_(
            Product.name.ilike(search_filter),
            Product.description.ilike(search_filter)
        ))

    # Advanced Filtering (Price & Stock)
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    in_stock = request.args.get('in_stock', type=str)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if in_stock and in_stock.lower() == 'true':
        query = query.filter(Product.stock_quantity > 0)

    # Sorting
    if sort == 'price_asc':
        query = query.order_by(Product.price.asc())
    elif sort == 'price_desc':
        query = query.order_by(Product.price.desc())
    else: # newest
        query = query.order_by(Product.created_at.desc())

    # Pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "success": True,
        "data": {
            "products": products_schema.dump(pagination.items),
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }
    })

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({
        "success": True,
        "data": {"product": product_schema.dump(product)}
    })

@products_bp.route('', methods=['POST'])
@admin_required()
def create_product():
    data = request.get_json()
    errors = product_schema.validate(data)
    if errors:
        return validation_error(errors)

    if Product.query.filter_by(slug=data['slug']).first():
        return error_response("SLUG_EXISTS", "A product with this slug already exists", 400)

    product = Product(**data)
    db.session.add(product)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Product created successfully",
        "data": {"product": product_schema.dump(product)}
    }), 201

@products_bp.route('/<int:product_id>', methods=['PUT'])
@admin_required()
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    # Partial validation
    errors = product_schema.validate(data, partial=True)
    if errors:
        return validation_error(errors)

    for key, value in data.items():
        setattr(product, key, value)
    
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Product updated successfully",
        "data": {"product": product_schema.dump(product)}
    })

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@admin_required()
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    
    # Soft delete by deactivating
    product.is_active = False
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Product deleted successfully (deactivated)"
    })

# --- Review Routes ---

from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.review import Review

@products_bp.route('/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    Product.query.get_or_404(product_id)
    reviews = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc()).all()
    
    # Calculate average rating
    total_reviews = len(reviews)
    avg_rating = sum([r.rating for r in reviews]) / total_reviews if total_reviews > 0 else 0
    
    return jsonify({
        "success": True,
        "data": {
            "reviews": [r.to_dict() for r in reviews],
            "average_rating": round(avg_rating, 1),
            "total_reviews": total_reviews
        }
    })

@products_bp.route('/<int:product_id>/reviews', methods=['POST'])
@jwt_required()
def add_product_review(product_id):
    user_id = get_jwt_identity()
    Product.query.get_or_404(product_id)
    
    data = request.get_json()
    rating = data.get('rating')
    comment = data.get('comment', '')
    
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return error_response("INVALID_RATING", "Rating must be an integer between 1 and 5", 400)
        
    # Check if user already reviewed
    existing_review = Review.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing_review:
        # Update existing review
        existing_review.rating = rating
        existing_review.comment = comment
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Review updated successfully",
            "data": {"review": existing_review.to_dict()}
        })
        
    new_review = Review(user_id=user_id, product_id=product_id, rating=rating, comment=comment)
    db.session.add(new_review)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Review added successfully",
        "data": {"review": new_review.to_dict()}
    }), 201
