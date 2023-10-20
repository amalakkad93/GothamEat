from flask import Blueprint, jsonify
from ..helper_functions import get_uber_access_token
from sqlite3 import OperationalError
import requests

ubereats_routes = Blueprint('ubereats', __name__)

@ubereats_routes.route('/get-uber-token', methods=['GET'])
def test_uber_token():
    try:
        token = get_uber_access_token()
        return jsonify({"token": token}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400  # Bad Request

    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500

    except Exception as e:
        print(str(e))
        return jsonify({"error": "An error occurred while fetching to get UberEat Token."}), 500  # Internal Server Error


# @ubereats_routes.route('/<string:id>')
# def get_ubereats_restaurant_detail(id):
#     # Fetch and return data directly from UberEats API
#     restaurant_data = fetch_from_ubereats_api(id)
#     access_token = get_uber_access_token()
#     restaurant_data = fetch_from_ubereats_api(id, access_token)
#     return jsonify(restaurant_data)
