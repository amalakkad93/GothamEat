from flask import current_app, Blueprint, jsonify

# Blueprint for routes related to Google Maps
maps_routes = Blueprint('maps', __name__)

@maps_routes.route('/key', methods=['POST'])
def get_api_key():
    """
    Retrieve the Google Maps API key.

    This route is primarily used to provide the frontend with the necessary
    Google Maps API key to make direct requests to the Google Maps services.

    Returns:
        dict: A dictionary containing the Google Maps API key or an error message.
    """
    # Fetch the API key from the Flask app configuration
    google_maps_api_key = current_app.config.get('MAPS_API_KEY')

    # Debugging line to print the API key to the server logs
    # (Remove this line in production for security reasons)
    print("Backend API Key:", google_maps_api_key)

    # If API key exists, send it to the frontend
    if google_maps_api_key:
        return jsonify(google_maps_api_key=google_maps_api_key)
    # If API key does not exist or is not configured, send an error
    else:
        return jsonify(error="API key not configured"), 500

