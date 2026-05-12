from flask import Blueprint, request, jsonify
import imghdr

from ..utils.s3_helper import s3_helper
from ..utils.decorators import admin_required
from ..utils.errors import error_response

uploads_bp = Blueprint('uploads', __name__, url_prefix='/api/v1/upload')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 2 * 1024 * 1024 # 2MB

@uploads_bp.route('/product-image', methods=['POST'])
@admin_required()
def upload_product_image():
    # 1. Check if file is present
    if 'file' not in request.files:
        return error_response("NO_FILE", "No file part in the request", 400)
    
    file = request.files['file']
    
    if file.filename == '':
        return error_response("EMPTY_FILENAME", "No selected file", 400)

    # 2. Validate MIME type using magic bytes (not just extension)
    # imghdr reads the first few bytes to determine the image type
    header = file.read(512)
    file.seek(0) # Reset file pointer after reading header
    
    img_type = imghdr.what(None, h=header)
    if img_type not in ALLOWED_EXTENSIONS:
        return error_response("INVALID_FILE_TYPE", f"Allowed types: {', '.join(ALLOWED_EXTENSIONS)}", 400)

    # 3. Validate File Size
    file.seek(0, 2) # Seek to end
    size = file.tell()
    file.seek(0) # Reset
    
    if size > MAX_FILE_SIZE:
        return error_response("FILE_TOO_LARGE", "Maximum file size is 2MB", 400)

    # 4. Upload and Process
    result = s3_helper.upload_image(file)
    
    if not result:
        return error_response("UPLOAD_FAILED", "Could not process or upload image", 500)

    return jsonify({
        "success": True,
        "message": "Image uploaded successfully",
        "data": result
    })
