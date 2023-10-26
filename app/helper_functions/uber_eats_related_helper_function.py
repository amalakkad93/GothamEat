from sqlite3 import OperationalError
import base64
from flask_caching import Cache
import requests
from flask import current_app
from app.config import cache
import datetime
import random
import math
import logging

# Set up logging to capture error messages and other logs.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ***************************************************************
# Map UberEats Data to Restaurant Model
# ***************************************************************
def map_ubereats_to_restaurant_model(ubereats_data):
    """
    Maps the data fetched from the UberEats API to the restaurant model.

    Parameters:
    - ubereats_data (dict): The raw data fetched from the UberEats API.

    Returns:
    - dict: A dictionary containing the mapped restaurant data.

    Notes:
    - The exact field names in the returned dictionary might vary based on the
      structure of the UberEats API data.
    """
    return {
        'store_id': ubereats_data.get('store_id'),
        'name': ubereats_data.get('name'),
        'street_address': ubereats_data.get('address'),
        'banner_image_path': ubereats_data.get('image_url'),
        'city': ubereats_data.get('city'),
        'state': ubereats_data.get('state'),
        'postal_code': ubereats_data.get('postal_code'),
        'country': ubereats_data.get('country'),
        'latitude': ubereats_data.get('latitude'),
        'longitude': ubereats_data.get('longitude'),
        'description': ubereats_data.get('description'),
        'opening_time': ubereats_data.get('opening_time'),
        'closing_time': ubereats_data.get('closing_time'),
        'average_rating': ubereats_data.get('rating'),
        'delivery_fee': ubereats_data.get('delivery_fee'),
        'delivery_time_estimate': ubereats_data.get('delivery_time_estimate')
    }

# ***************************************************************
# Fetch Nearby Restaurants from UberEats by Location
# ***************************************************************
def fetch_from_ubereats_by_location(latitude, longitude, access_token):
    """
    Retrieve nearby restaurants from UberEats based on location.

    Parameters:
    - latitude (float): Latitude of the desired location.
    - longitude (float): Longitude of the desired location.
    - access_token (str): Authorization token for the UberEats API.

    Returns:
    - dict: A dictionary containing data about nearby restaurants.
    """
    # Construct the UberEats API endpoint using the provided latitude and longitude
    endpoint = f"https://api.uber.com/v1/eats/stores?latitude={latitude}&longitude={longitude}"

    # Define headers for the request, including the provided access token
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    try:
        # Send a GET request to the UberEats API
        response = requests.get(endpoint, headers=headers)

        # Check if the response was successful; if not, raise an error
        response.raise_for_status()

        # Parse the JSON data from the response
        data = response.json()

        # Return the parsed data
        return data
    except requests.RequestException as e:
        # If there's an error with the request, print it and return None
        logger.error(f"Error fetching data from UberEats API: {e}")
        return None

# ***************************************************************
# Fetch Nearby Restaurants
# ***************************************************************
def fetch_ubereats_data(latitude, longitude, client_id, client_secret):
    """
    Fetch and map nearby restaurants from UberEats based on location.

    Args:
        latitude (str): Latitude of the location.
        longitude (str): Longitude of the location.
        client_id (str): UberEats client ID.
        client_secret (str): UberEats client secret.

    Returns:
        List[dict]: List of mapped restaurant data from UberEats.
    """
    try:
        access_token = get_uber_access_token(client_id, client_secret)
        restaurants = fetch_from_ubereats_by_location(latitude, longitude, access_token)
        return [map_ubereats_to_restaurant_model(r) for r in restaurants] if restaurants else []
    except Exception as e:
        logger.error(f"Error fetching data from UberEats: {e}")
        return []


# ***************************************************************
# Get Uber Access Token
# ***************************************************************
def get_uber_access_token(client_id, client_secret):
    """
    Get UberEats API token using client credentials.

    Args:
        client_id (str): UberEats client ID.
        client_secret (str): UberEats client secret.

    Returns:
        str: UberEats API token.
    """
    # # Retrieve Uber API credentials from the app's configuration
    # UBER_CLIENT_ID = current_app.config['UBER_CLIENT_ID']
    # UBER_CLIENT_SECRET = current_app.config['UBER_CLIENT_SECRET']

    # Define the UberEats token endpoint
    auth_url = "https://login.uber.com/oauth/v2/token"

    # Construct headers for the request, including the base64-encoded client credentials
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {base64.b64encode(f'{client_id}:{client_secret}'.encode()).decode()}"
    }

    # Define the payload for the token request
    payload = {
        "grant_type": "client_credentials",
        "scope": "eats.restaurant"
    }
    try:
        # Send a POST request to get the access token
        response = requests.post(auth_url, headers=headers, data=payload)
        response.raise_for_status()
        return response.json()['access_token']

    except requests.RequestException as e:
        error_message = f"Failed to get Uber access token. Error: {response.json().get('error_description', 'Unknown error')}"
        logger.error(error_message)
        raise ValueError(error_message)

# ***************************************************************
# Fetch Restaurant Details from UberEats API by Store ID
# ***************************************************************
def fetch_from_ubereats_api_by_store_id(store_id, access_token):
    """
    Fetch detailed data for a specific restaurant from UberEats based on its store ID.

    Parameters:
    - store_id (str): The ID of the restaurant/store.
    - access_token (str): Authorization token for the UberEats API.

    Returns:
    - dict: A dictionary containing detailed data about the specified restaurant.
    """
    # Construct the UberEats API endpoint using the provided store ID
    endpoint = f"https://api.uber.com/v1/eats/stores/{store_id}"

    # Define headers for the request, including the provided access token
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    try:
        # Send a GET request to the UberEats API for the specific store
        response = requests.get(endpoint, headers=headers)

        # Check if the response was successful; if not, raise an error
        response.raise_for_status()

        # Parse the JSON data from the response
        data = response.json()

        # Return the parsed data
        return data
    except requests.RequestException as e:
        # If there's an error with the request, print it and return None
        logger.error(f"Error fetching data from UberEats API: {e}")
        return None
