from flask import current_app, Blueprint, jsonify

maps_routes = Blueprint('maps', __name__)

@maps_routes.route('/key', methods=['POST'])
def get_api_key():
    google_maps_api_key = current_app.config.get('MAPS_API_KEY')
    print("Backend API Key:", google_maps_api_key)  # Add this line
    if google_maps_api_key:
        return jsonify(google_maps_api_key=google_maps_api_key)
    else:
        return jsonify(error="API key not configured"), 500
