from flask import Flask
import os
from .extensions import db, jwt, cors, migrate, socketio
from .config import config_by_name

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
        
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, supports_credentials=True, origins=["http://localhost:5173", "https://main.d1thxv6ti1apfa.amplifyapp.com"])
    migrate.init_app(app, db)
    socketio.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.products import products_bp, categories_bp
    from .routes.cart import cart_bp
    from .routes.orders import orders_bp
    from .routes.uploads import uploads_bp
    from .routes.admin import admin_bp
    from .routes.health import health_bp
    from .routes.wishlist import wishlist_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(uploads_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(wishlist_bp)

    return app
