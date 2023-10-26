from sqlite3 import OperationalError
import math
import logging

# Set up logging to capture error messages and other logs.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ***************************************************************
# Aggregate Restaurant Data from Database by Coordinates (Latitude and Longitude)
# ***************************************************************
def aggregate_restaurant_data_by_coordinates(latitude, longitude):
    """
    Fetch restaurants from the database based on provided latitude and longitude.

    Args:
    - latitude (float): Latitude of the desired location.
    - longitude (float): Longitude of the desired location.

    Returns:
    - List[dict]: List of mapped restaurant data from the local database based on the provided coordinates.
    """
    # Fetch data based on latitude and longitude from your local database
    restaurants = fetch_from_database_by_coordinates(latitude, longitude)
    return [r.to_dict() for r in restaurants]

# ***************************************************************
# Aggregate Restaurant Data from Database by City, State, and Country
# ***************************************************************
def aggregate_restaurant_data_by_city_state_country(city_name, state_name, country_name):
    """
    Fetch restaurants from the database based on provided city, state, and country.

    Args:
    - city_name (str): Name of the city.
    - state_name (str): Name of the state.
    - country_name (str): Name of the country.

    Returns:
    - List[dict]: List of mapped restaurant data from the local database based on the provided city, state, and country.
    """
    # Fetch data based on city, state, and country from your local database
    restaurants = fetch_from_database_by_city_state_country(city_name, state_name, country_name)
    return [r.to_dict() for r in restaurants]


# ***************************************************************
# Fetch Restaurants from Database by City, State, and Country
# ***************************************************************
def fetch_from_database_by_city_state_country(city_name=None, state_name=None, country_name=None):
    """
    Fetch restaurants from the database based on city, state, and country.

    Args:
    - city_name (str): Name of the city.
    - state_name (str): Name of the state.
    - country_name (str): Name of the country.

    Returns:
    - List[Restaurant]: List of restaurants matching the criteria.
    """
    from ..models import Restaurant

    if city_name and state_name and country_name:
        # Log the city name being searched for
        logger.info(f"Fetching restaurants for city: {city_name}, state: {state_name}, country: {country_name}")

        nearby_restaurants = (
            Restaurant.query
            .filter_by(city=city_name, state=state_name, country=country_name)
            .all()
        )
    else:
        nearby_restaurants = []

    # Log the number of restaurants fetched
    logger.info(f"Fetched {len(nearby_restaurants)} restaurants from the database")

    return nearby_restaurants


# ***************************************************************
# Fetch Restaurants from Database by City, State, and Country
# ***************************************************************
def fetch_local_db_data(city_name, state_name=None, country_name=None):
    """
    Fetch and map restaurants from the local database based on the city name, state, and country.

    Args:
        city_name (str): Name of the city.
        state_name (str, optional): Name of the state. Defaults to None.
        country_name (str, optional): Name of the country. Defaults to None.

    Returns:
        List[dict]: List of mapped restaurant data from the local database.
    """
    try:
        restaurants = fetch_from_database_by_city_state_country(city_name=city_name, state_name=state_name, country_name=country_name)
        return [r.to_dict() for r in restaurants]
    except OperationalError as oe:
        logger.error(oe)
        return [{"error": "Database operation failed. Please try again later."}]
    except Exception as e:
        logger.error(f"Error fetching data from database: {e}")
        return []


# ***************************************************************
# Fetch Restaurants from Database by Coordinates (Latitude and Longitude)
# ***************************************************************
def fetch_from_database_by_coordinates(latitude=None, longitude=None, city_name=None, radius=5.0):  # Increased default radius to 5.0 km
    """
    Fetch restaurants from the database based on location (latitude, longitude) or city name.

    Args:
    - latitude (float): Latitude of the desired location.
    - longitude (float): Longitude of the desired location.
    - city_name (str): Name of the city.
    - radius (float): The difference in lat/lon to consider as "nearby". Default is 5.0 km.

    Returns:
    - List[Restaurant]: List of nearby restaurants.
    """
    from ..models import Restaurant

    # If latitude and longitude are provided, search by location
    if latitude and longitude:
        # Define a bounding box around the provided location for quick filtering
        lat_min, lat_max = latitude - radius, latitude + radius
        lon_min, lon_max = longitude - radius, longitude + radius

        logger.info(f"Bounding box for latitude: {lat_min} to {lat_max}")
        logger.info(f"Bounding box for longitude: {lon_min} to {lon_max}")

        # Fetch restaurants that are within this bounding box
        nearby_restaurants = (
            Restaurant.query
            .filter(Restaurant.latitude.between(lat_min, lat_max))
            .filter(Restaurant.longitude.between(lon_min, lon_max))
            .all()
        )

    # If a city name is provided, fetch restaurants associated with that city
    elif city_name:
        logger.info(f"Fetching restaurants for city: {city_name}")
        nearby_restaurants = (
            Restaurant.query
            .filter_by(city=city_name)
            .all()
        )
    else:
        nearby_restaurants = []

    logger.info(f"Nearby restaurants count: {len(nearby_restaurants)}")

    # Further filter the results by exact distance using the haversine formula
    filtered_restaurants = []
    for restaurant in nearby_restaurants:
        distance = haversine_distance(latitude, longitude, restaurant.latitude, restaurant.longitude)
        logger.info(f"Distance to restaurant {restaurant.name}: {distance} km")
        if distance <= radius:
            filtered_restaurants.append(restaurant)

    logger.info(f"Filtered restaurants count (after haversine check): {len(filtered_restaurants)}")

    return filtered_restaurants


# ***************************************************************
# Calculate Haversine Distance between Two Points
# ***************************************************************
def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points on the Earth (specified in decimal degrees)

    Args:
    - lat1, lon1: Latitude and Longitude of the first point.
    - lat2, lon2: Latitude and Longitude of the second point.

    Returns:
    - float: Distance between the two points in kilometers.
    """

    # Convert degrees to radians for trigonometry
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Calculate the differences in coordinates
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Apply the Haversine formula
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    # Radius of Earth in kilometers
    r = 6371

    # Calculate the actual distance
    distance = r * c

    return distance
