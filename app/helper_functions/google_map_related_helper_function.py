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
# Map Google Place Data to Restaurant Model
# ***************************************************************
def map_google_place_to_restaurant_model(google_place_data):
    """
    Maps the provided Google Place data to a restaurant model.

    The function extracts necessary information from the Google Place data and
    processes it to fit the structure of a restaurant model.

    Args:
        google_place_data (dict): The Google Place data.

    Returns:
        dict: A dictionary containing information in the structure of the restaurant model.
    """
    # pass

    # Extract latitude and longitude from the Google Place data
    lat = google_place_data['geometry']['location']['lat']
    lng = google_place_data['geometry']['location']['lng']

    # Fetch address components using geocoding
    address_components = get_address_components_from_geocoding(lat, lng, current_app.config['MAPS_API_KEY'])

    opening_time = None
    closing_time = None
    opening_hours = google_place_data.get('opening_hours', {})

    # Extract opening and closing time for the current day
    if opening_hours:
        periods = opening_hours.get('periods', [])
        today = datetime.datetime.today().weekday()
        today_timings = next((period for period in periods if period['open']['day'] == today), None)
        if today_timings:
            opening_time = today_timings.get('open', {}).get('time')
            closing_time = today_timings.get('close', {}).get('time')

    # Generate random values for delivery fee and delivery time estimate
    delivery_fee = round(random.uniform(0.10, 12.00), 2)
    min_time = random.randint(10, 30)
    max_time = min_time + 10
    delivery_time_estimate = f"{min_time}-{max_time} min"

    # Return the mapped restaurant model
    return {
        'google_place_id': google_place_data.get('place_id'),
        'name': google_place_data.get('name'),
        'street_address': google_place_data.get('vicinity'),
        'banner_image_path': google_place_data.get('icon'),
        'city': address_components.get('city', None),
        'state': address_components.get('state', None),
        'postal_code': address_components.get('postal_code', None),
        'country': address_components.get('country', None),
        'latitude': lat,
        'longitude': lng,
        'description': None,
        'opening_time': opening_time,
        'closing_time': closing_time,
        'average_rating': google_place_data.get('rating', None),
        'delivery_fee': delivery_fee,
        'delivery_time_estimate': delivery_time_estimate
    }

# ***************************************************************
# Fetch Nearby Restaurants from Google Places by Location
# ***************************************************************
def fetch_google_places_data(latitude, longitude):
    """
    Fetch and map nearby restaurants from Google Places based on latitude and longitude.

    Args:
        latitude (str): Latitude of the location.
        longitude (str): Longitude of the location.

    Returns:
        List[dict]: List of mapped restaurant data from Google Places.
    """
    try:
        google_api_key = current_app.config['MAPS_API_KEY']
        endpoint = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&radius=1500&type=restaurant&key={google_api_key}"
        response = requests.get(endpoint)
        data = response.json()

        if response.status_code == 200 and data.get('status', '') == "OK":
            return [map_google_place_to_restaurant_model(r) for r in data['results']]
        return []
    except Exception as e:
        logger.error(f"Error fetching data from Google Places: {e}")
        return []

# ***************************************************************
# Get Address Components from Geocoding
# ***************************************************************
def get_address_components_from_geocoding(lat, lng, api_key):
    """
    Fetches address components using Google Geocoding API based on latitude and longitude.

    Args:
        lat (float): The latitude.
        lng (float): The longitude.
        api_key (str): The API key for Google Geocoding.

    Returns:
        dict: A dictionary containing various address components.
    """
    # pass

    # Define the endpoint for the Google Geocoding API
    endpoint = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={api_key}"
    response = requests.get(endpoint)
    data = response.json()

    # Check if there are results in the response
    if 'results' not in data or not data['results']:
        return {}

    # Extract address components from the response
    address_components = data['results'][0].get('address_components', [])
    details = {}

    # Map each address component to its respective field in the details dictionary
    for component in address_components:
        types = component.get('types')
        if 'locality' in types:
            details['city'] = component.get('long_name')
        elif 'administrative_area_level_1' in types:
            details['state'] = component.get('long_name')
        elif 'country' in types:
            details['country'] = component.get('long_name')
        elif 'postal_code' in types:
            details['postal_code'] = component.get('long_name')

    return details

def get_coordinates_from_geocoding_service(city_name, api_key):
    """
    Fetches latitude and longitude coordinates using Google Geocoding API based on city name.

    Args:
        city_name (str): The name of the city.
        api_key (str): The API key for Google Geocoding.

    Returns:
        dict or None: A dictionary containing 'latitude' and 'longitude' keys or None if unsuccessful.
    """

    endpoint = f"https://maps.googleapis.com/maps/api/geocode/json?address={city_name}&key={api_key}"
    response = requests.get(endpoint)
    data = response.json()

    # Check if there are results in the response
    if data.get('status') == 'OK' and 'results' in data and data['results']:
        location = data['results'][0].get('geometry', {}).get('location', {})
        latitude = location.get('lat')
        longitude = location.get('lng')

        if latitude and longitude:
            return {'latitude': latitude, 'longitude': longitude}

    return None
