from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from flask_socketio import SocketIO

import redis
import os

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')

# Redis client for token blacklist and rate limiting
redis_client = redis.from_url(os.environ.get('REDIS_URL', 'redis://redis:6379/0'), decode_responses=True)
