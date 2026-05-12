import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get('ACCESS_TOKEN_EXPIRES_MINUTES', 15)) * 60
    JWT_REFRESH_TOKEN_EXPIRES = int(os.environ.get('REFRESH_TOKEN_EXPIRES_DAYS', 7)) * 86400
    
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    
class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False
    
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
