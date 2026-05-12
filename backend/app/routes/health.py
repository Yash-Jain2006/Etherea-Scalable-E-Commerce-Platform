from flask import Blueprint, jsonify
import requests
import os
from sqlalchemy import text
from ..extensions import db

health_bp = Blueprint('health', __name__, url_prefix='/api/v1')

@health_bp.route('/health', methods=['GET'])
def health_check():
    # 1. Check Database Connection
    db_status = "connected"
    try:
        db.session.execute(text('SELECT 1'))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    # 2. Get EC2 Instance ID (if running on AWS)
    instance_id = "local-dev"
    try:
        # Use a very short timeout for local development
        response = requests.get(
            'http://169.254.169.254/latest/meta-data/instance-id', 
            timeout=0.3
        )
        if response.status_code == 200:
            instance_id = response.text
    except:
        # Expected to fail in local dev
        pass

    return jsonify({
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "db": db_status,
        "instance_id": instance_id,
        "region": os.environ.get('AWS_REGION', 'ap-south-1'),
        "version": "1.0.0"
    }), 200 if db_status == "connected" else 500
