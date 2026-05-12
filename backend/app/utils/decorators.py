from functools import wraps
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from .errors import error_response

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            # In our implementation, we store the role in the JWT claims
            # or we could fetch it from the DB. 
            # For efficiency, let's assume we'll add 'role' to claims 
            # by updating the JWT identity loader later if needed, 
            # but for now we'll check the User model directly for safety.
            from ..models.user import User
            from flask_jwt_extended import get_jwt_identity
            
            user_id = get_jwt_identity()
            user = User.query.get(int(user_id))
            
            if not user or user.role != 'admin':
                return error_response("FORBIDDEN", "Admin privilege required", 403)
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper
