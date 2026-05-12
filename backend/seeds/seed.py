import os
import sys
from datetime import datetime
import bcrypt
from decimal import Decimal

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.category import Category
from app.models.product import Product

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')

def seed_data():
    app = create_app()
    with app.app_context():
        print("🌱 Starting database seeding...")

        # 1. Seed Categories
        categories_data = [
            {"name": "Electronics", "slug": "electronics", "description": "Latest gadgets and devices"},
            {"name": "Footwear",    "slug": "footwear",    "description": "Shoes for every occasion"},
            {"name": "Books",       "slug": "books",       "description": "Knowledge and stories"},
            {"name": "Fitness",     "slug": "fitness",     "description": "Gym and workout gear"},
            {"name": "Fashion",     "slug": "fashion",     "description": "Trendy apparel"},
            {"name": "Kitchen",     "slug": "kitchen",     "description": "Modern cooking tools"}
        ]

        categories = {}
        for cat_data in categories_data:
            existing = Category.query.filter_by(slug=cat_data['slug']).first()
            if not existing:
                cat = Category(**cat_data)
                db.session.add(cat)
                db.session.flush() # Get ID
                categories[cat.slug] = cat
                print(f"  + Category: {cat.name}")
            else:
                categories[existing.slug] = existing
                print(f"  . Category exists: {existing.name}")

        # 2. Seed Products (2 per category, Indian ₹ prices)
        products_data = [
            # Electronics
            {"name": "Pro Wireless Headphones", "slug": "pro-wireless-headphones", "price": 4999.00, "stock_quantity": 50, "category_slug": "electronics"},
            {"name": "Smart Watch Series 5",   "slug": "smart-watch-series-5",   "price": 12999.00, "stock_quantity": 30, "category_slug": "electronics"},
            # Footwear
            {"name": "Ultra-Lite Running Shoes", "slug": "ultra-lite-running-shoes", "price": 2499.00, "stock_quantity": 100, "category_slug": "footwear"},
            {"name": "Classic Leather Boots",    "slug": "classic-leather-boots",    "price": 3999.00, "stock_quantity": 25, "category_slug": "footwear"},
            # Books
            {"name": "Clean Code",               "slug": "clean-code",               "price": 899.00, "stock_quantity": 150, "category_slug": "books"},
            {"name": "Atomic Habits",            "slug": "atomic-habits",            "price": 499.00, "stock_quantity": 200, "category_slug": "books"},
            # Fitness
            {"name": "Adjustable Dumbbell Set",  "slug": "adjustable-dumbbell-set",  "price": 7999.00, "stock_quantity": 15, "category_slug": "fitness"},
            {"name": "Premium Yoga Mat",         "slug": "premium-yoga-mat",         "price": 1299.00, "stock_quantity": 60, "category_slug": "fitness"},
            # Fashion
            {"name": "Cotton Oversized T-Shirt", "slug": "cotton-oversized-t-shirt", "price": 999.00, "stock_quantity": 120, "category_slug": "fashion"},
            {"name": "Denim Jacket",             "slug": "denim-jacket",             "price": 2799.00, "stock_quantity": 40, "category_slug": "fashion"},
            # Kitchen
            {"name": "Air Fryer 4L",             "slug": "air-fryer-4l",             "price": 6499.00, "stock_quantity": 20, "category_slug": "kitchen"},
            {"name": "Electric Kettle 1.5L",     "slug": "electric-kettle-1-5l",     "price": 1199.00, "stock_quantity": 80, "category_slug": "kitchen"}
        ]

        for prod_data in products_data:
            existing = Product.query.filter_by(slug=prod_data['slug']).first()
            if not existing:
                cat_slug = prod_data.pop('category_slug')
                prod_data['category_id'] = categories[cat_slug].id
                prod_data['image_url'] = f"https://placeholder.com/{prod_data['slug']}.webp" # Placeholder for now
                product = Product(**prod_data)
                db.session.add(product)
                print(f"  + Product: {product.name}")
            else:
                print(f"  . Product exists: {existing.name}")

        # 3. Seed Users
        # Admin User
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin@123')
        
        if not User.query.filter_by(email=admin_email).first():
            admin = User(
                email=admin_email,
                password_hash=hash_password(admin_password),
                full_name="System Admin",
                role="admin"
            )
            db.session.add(admin)
            print(f"  + Admin User created: {admin_email}")
        else:
            print(f"  . Admin User exists: {admin_email}")

        # Regular Test User
        test_email = "test@example.com"
        test_password = "Test@1234"
        if not User.query.filter_by(email=test_email).first():
            user = User(
                email=test_email,
                password_hash=hash_password(test_password),
                full_name="John Doe",
                role="customer"
            )
            db.session.add(user)
            print(f"  + Test User created: {test_email}")
        else:
            print(f"  . Test User exists: {test_email}")

        db.session.commit()
        print("✅ Seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
