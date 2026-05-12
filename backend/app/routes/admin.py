from flask import Blueprint, request, jsonify
from sqlalchemy import func

from ..extensions import db
from ..models.user import User
from ..models.product import Product
from ..models.order import Order
from ..schemas.user_schema import UserSchema
from ..schemas.order_schema import OrderSchema
from ..utils.decorators import admin_required
from ..utils.errors import error_response

admin_bp = Blueprint('admin', __name__, url_prefix='/api/v1/admin')

user_schema = UserSchema(many=True)
order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_stats():
    # 1. Total Users
    total_users = User.query.count()
    
    # 2. Total Products (Active)
    total_products = Product.query.filter_by(is_active=True).count()
    
    # 3. Total Orders
    total_orders = Order.query.count()
    
    # 4. Total Revenue (Confirmed, Shipped, Delivered)
    revenue_query = db.session.query(func.sum(Order.total)).filter(
        Order.status.in_(['confirmed', 'shipped', 'delivered'])
    ).scalar()
    total_revenue = float(revenue_query or 0)
    
    # 5. Recent Orders (Last 5)
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    
    return jsonify({
        "success": True,
        "data": {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "recent_orders": orders_schema.dump(recent_orders)
        }
    })

@admin_bp.route('/orders', methods=['GET'])
@admin_required()
def list_all_orders():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    
    query = Order.query
    if status:
        query = query.filter_by(status=status)
        
    query = query.order_by(Order.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "success": True,
        "data": {
            "orders": orders_schema.dump(pagination.items),
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }
    })

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required()
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    new_status = data.get('status')
    
    valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        return error_response("INVALID_STATUS", f"Valid statuses: {', '.join(valid_statuses)}", 400)
        
    order.status = new_status
    db.session.commit()
    
    # Emit real-time status update via WebSockets
    from ..extensions import socketio
    socketio.emit('order_status_update', {
        'order_id': order.id,
        'user_id': order.user_id,
        'status': new_status
    }, room=f"user_{order.user_id}")
    
    return jsonify({
        "success": True,
        "message": f"Order status updated to {new_status}",
        "data": {"order": order_schema.dump(order)}
    })

@admin_bp.route('/users', methods=['GET'])
@admin_required()
def list_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = User.query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "success": True,
        "data": {
            "users": user_schema.dump(pagination.items),
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }
    })
