import logging
from flask import current_app
from sqlalchemy.orm import joinedload
from .normalize_data import normalize_data
from .google_map_related_helper_function import fetch_google_places_data
from .uber_eats_related_helper_function import fetch_ubereats_data
from .database_related_helper_function import fetch_local_db_data

logger = logging.getLogger(__name__)

def aggregate_restaurant_data(latitude, longitude, city_name=None, state_name=None, country_name=None):
    """
    Aggregate restaurant data from various sources based on latitude, longitude, and city name.

    Args:
        latitude (float): Latitude coordinate.
        longitude (float): Longitude coordinate.
        city_name (str, optional): Name of the city. Defaults to None.
        state_name (str, optional): Name of the state. Defaults to None.
        country_name (str, optional): Name of the country. Defaults to None.

    Returns:
        list: A list of aggregated restaurant data.
    """

    client_id = current_app.config['UBER_CLIENT_ID']
    client_secret = current_app.config['UBER_CLIENT_SECRET']

    # Define data sources and their fetching functions
    data_sources = [
        # {"name": "UberEats", "function": lambda: fetch_ubereats_data(latitude, longitude, client_id, client_secret)},
        # {"name": "Google Places", "function": lambda: fetch_google_places_data(latitude, longitude)},
        {"name": "Local Database", "function": lambda: fetch_local_db_data(city_name, state_name, country_name)} #if city_name and state_name and country_name else []}
    ]

    aggregated_results = []

    # Fetch data from each source
    for source in data_sources:
        try:
            results = source["function"]()
            logger.info(f"Data from {source['name']}: {results}")
            aggregated_results.extend(results)
        except Exception as e:
            logger.error(f"Error fetching data from {source['name']}: {e}")

    return aggregated_results

def fetch_menu_items_for_restaurant(restaurant_id):
    """
    Fetches menu items and their associated images for a specific restaurant from the local database.

    Args:
        restaurant_id (int): The ID of the restaurant for which the menu items are to be retrieved.

    Returns:
        dict: A dictionary containing normalized menu items and their images for the specified restaurant.
    """
    from ..models import db, MenuItem, MenuItemImg
    # Query the database to get all menu items for the given restaurant ID
    menu_items = (
        db.session.query(MenuItem)
        .filter(MenuItem.restaurant_id == restaurant_id)
        .options(joinedload(MenuItem.menu_item_imgs))
        .all()
    )

    # Extract details of each menu item and its associated images
    menu_items_list, images_list = [], []
    for item in menu_items:
        item_dict = item.to_dict()
        item_dict["menu_item_img_ids"] = [img.id for img in item.menu_item_imgs]
        menu_items_list.append(item_dict)
        for img in item.menu_item_imgs:
            images_list.append(img.to_dict())

    # Normalize the data for menu items and images for easier frontend consumption
    normalized_menu_items = normalize_data(menu_items_list, 'id')
    normalized_images = normalize_data(images_list, 'id')

    return {
        "entities": {
            "menuItems": normalized_menu_items,
            "menuItemImages": normalized_images
        }
    }
