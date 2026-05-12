from flask import jsonify

def error_response(code, message, http_status=400):
    response = {
        "success": False,
        "error": code,
        "message": message
    }
    return jsonify(response), http_status

def validation_error(errors):
    return jsonify({
        "success": False,
        "error": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "errors": errors
    }), 422
