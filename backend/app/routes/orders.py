from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import random

from ..extensions import db
from ..models.order import Order
from ..models.order_item import OrderItem
from ..models.cart import CartItem
from ..models.product import Product
from ..schemas.order_schema import OrderSchema
from ..utils.errors import error_response, validation_error

orders_bp = Blueprint('orders', __name__, url_prefix='/api/v1/orders')
order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

@orders_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # 1. Validate Input (Shipping Address & Payment Method)
    errors = order_schema.validate(data, partial=True)
    if errors:
        return validation_error(errors)
    
    shipping_address = data.get('shipping_address')
    payment_method = data.get('payment_method')
    
    if not shipping_address or not payment_method:
        return error_response("MISSING_DATA", "Shipping address and payment method are required", 400)

    # 2. Get Cart Items
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    if not cart_items:
        return error_response("EMPTY_CART", "Cannot checkout with an empty cart", 400)

    # 3. Validate Stock & Calculate Totals
    subtotal = 0
    order_items_to_create = []
    products_to_update = []

    for item in cart_items:
        product = item.product
        if product.stock_quantity < item.quantity:
            return error_response("INSUFFICIENT_STOCK", f"Not enough stock for {product.name}", 400)
        
        item_subtotal = product.price * item.quantity
        subtotal += item_subtotal
        
        # Prepare OrderItem (Snapshot)
        order_item = OrderItem(
            product_id=product.id,
            product_name=product.name,
            product_image=product.image_url,
            quantity=item.quantity,
            unit_price=product.price,
            subtotal=item_subtotal
        )
        order_items_to_create.append(order_item)
        
        # Prepare Stock Update
        product.stock_quantity -= item.quantity
        products_to_update.append(product)

    shipping_fee = 50.00
    total = subtotal + shipping_fee

    # 4. Simulate Payment (90% success rate)
    payment_success = random.random() < 0.90
    if not payment_success:
        # We don't rollback stock here because we haven't committed anything yet
        return error_response("PAYMENT_DECLINED", "Payment declined. Please try again or use a different method.", 402)

    # 5. Create Order
    try:
        new_order = Order(
            user_id=user_id,
            status='confirmed',
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            total=total,
            payment_method=payment_method,
            payment_status='paid',
            shipping_address=shipping_address
        )
        
        db.session.add(new_order)
        db.session.flush() # Get order ID

        for oi in order_items_to_create:
            oi.order_id = new_order.id
            db.session.add(oi)

        # 6. Clear Cart
        CartItem.query.filter_by(user_id=user_id).delete()

        # 7. Commit Everything
        db.session.commit()
        
        # 8. Send Email Notification (AWS SES)
        try:
            from ..models.user import User
            from ..utils.email import send_order_confirmation_email
            import threading
            
            user = User.query.get(user_id)
            if user:
                # Send asynchronously so it doesn't block the API response
                email_thread = threading.Thread(
                    target=send_order_confirmation_email,
                    args=(user.email, user.full_name, new_order)
                )
                email_thread.start()
        except Exception as email_err:
            print(f"Non-fatal error starting email thread: {email_err}")

        return jsonify({
            "success": True,
            "message": "Order placed successfully",
            "data": {"order": order_schema.dump(new_order)}
        }), 201

    except Exception as e:
        db.session.rollback()
        return error_response("ORDER_FAILED", f"Could not process order: {str(e)}", 500)

@orders_bp.route('', methods=['GET'])
@jwt_required()
def list_orders():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc())
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

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    # Ensure user can only see their own order
    order = Order.query.filter_by(id=order_id, user_id=user_id).first_or_404()
    
    return jsonify({
        "success": True,
        "data": {"order": order_schema.dump(order)}
    })

# --- WebSocket Events ---
from ..extensions import socketio
from flask_socketio import join_room

@socketio.on('join')
def on_join(data):
    user_id = data.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        join_room(room)
        print(f"User {user_id} joined room {room}")
