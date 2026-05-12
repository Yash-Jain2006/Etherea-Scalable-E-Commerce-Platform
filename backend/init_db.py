from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.review import Review
from app.models.wishlist import Wishlist
from app.models.cart import CartItem
from app.models.order import Order
from app.models.order_item import OrderItem
import bcrypt

app = create_app()
with app.app_context():
    print("Creating database tables...")
    db.drop_all() # Reset for fresh seed
    db.create_all()
    print("Tables created successfully!")

    print("Seeding database...")
    
    # 0. Users
    hashed_pw = bcrypt.hashpw("jain@123".encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')
    admin_user = User(
        email="yash02arcade@gmail.com",
        password_hash=hashed_pw,
        full_name="Yash Admin",
        role="admin"
    )
    db.session.add(admin_user)
    db.session.commit()

    # 1. Categories
    tech = Category(name="Premium Tech", slug="premium-tech", description="Cutting edge gadgets")
    audio = Category(name="Audio", slug="audio", description="High fidelity sound")
    wearables = Category(name="Wearables", slug="wearables", description="Smart watches and more")
    db.session.add_all([tech, audio, wearables])
    db.session.commit()

    # 2. Products
    p1 = Product(
        name="Quantum Headphones",
        slug="quantum-headphones",
        description="Active noise cancelling with 40h battery life and spatial audio support.",
        price=24999.0,
        stock_quantity=15,
        category_id=audio.id,
        image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    )
    
    p2 = Product(
        name="Nebula Smartwatch",
        slug="nebula-smartwatch",
        description="OLED display, heart rate monitoring, and 5ATM water resistance.",
        price=18500.0,
        stock_quantity=20,
        category_id=wearables.id,
        image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
    )

    p3 = Product(
        name="Astra Laptop M1",
        slug="astra-laptop",
        description="Ultra-thin aluminum chassis, 16GB RAM, and 512GB NVMe SSD.",
        price=89999.0,
        stock_quantity=5,
        category_id=tech.id,
        image_url="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"
    )

    p4 = Product(
        name="Titan Gaming Mouse",
        slug="titan-mouse",
        description="26,000 DPI sensor, optical switches, and customizable RGB lighting.",
        price=4500.0,
        stock_quantity=50,
        category_id=tech.id,
        image_url="https://images.unsplash.com/photo-1527814050087-37a3c71cc0a5?w=800&q=80"
    )

    db.session.add_all([p1, p2, p3, p4])
    db.session.commit()
    print("Database seeded successfully!")
