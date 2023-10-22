import base64
from flask_caching import Cache
import requests
from flask import current_app
from app.config import cache
import datetime
import random



# *******************************map_ubereats_to_restaurant_model *******************************
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
        'description': ubereats_data.get('description'),
        'opening_time': ubereats_data.get('opening_time'),
        'closing_time': ubereats_data.get('closing_time'),
        'average_rating': ubereats_data.get('rating'),
        'delivery_fee': ubereats_data.get('delivery_fee'),
        'delivery_time_estimate': ubereats_data.get('delivery_time_estimate')
    }


# *******************************fetch_from_ubereats_by_location*******************************
def fetch_from_ubereats_by_location(latitude, longitude, access_token):
    """
    Fetch nearby restaurants from UberEats based on latitude and longitude.

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
        print(f"Error fetching data from UberEats API: {e}")
        return None

# *******************get_uber_access_token*******************************
def get_uber_access_token():
    """
    Fetch an access token for the UberEats API using client credentials.

    Returns:
    - str: An access token for the UberEats API.
    """
    # Retrieve Uber API credentials from the app's configuration
    UBER_CLIENT_ID = current_app.config['UBER_CLIENT_ID']
    UBER_CLIENT_SECRET = current_app.config['UBER_CLIENT_SECRET']

    # Define the UberEats token endpoint
    auth_url = "https://login.uber.com/oauth/v2/token"

    # Construct headers for the request, including the base64-encoded client credentials
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {base64.b64encode(f'{UBER_CLIENT_ID}:{UBER_CLIENT_SECRET}'.encode()).decode()}"
    }

    # Define the payload for the token request
    payload = {
        "grant_type": "client_credentials",
        "scope": "eats.restaurant"
    }

    # Send a POST request to get the access token
    response = requests.post(auth_url, headers=headers, data=payload)

    # Parse the JSON data from the response
    data = response.json()

    # If the response is unsuccessful, raise an error with a helpful message
    if response.status_code != 200:
        error_message = f"Failed to get Uber access token. Error: {data.get('error_description', 'Unknown error')}"
        print(error_message)
        raise ValueError(error_message)

    # Return the access token
    return data['access_token']

# *******************************fetch_from_ubereats_api*******************************
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
        print(f"Error fetching data from UberEats API: {e}")
        return None


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
        'description': None,
        'opening_time': opening_time,
        'closing_time': closing_time,
        'average_rating': google_place_data.get('rating', None),
        'delivery_fee': delivery_fee,
        'delivery_time_estimate': delivery_time_estimate
    }

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


def fetch_from_database_by_city(city_name):
    """
    Fetch restaurants from the database that are located within a specified city.

    Args:
    - city_name (str): Name of the city.

    Returns:
    - List[Restaurant]: List of restaurants in the specified city.
    """
    from ..models import Restaurant
    # Filter restaurants by the provided city name
    restaurants_in_city = (
        Restaurant.query
        .filter_by(city=city_name)
        .all()
    )

    return restaurants_in_city
