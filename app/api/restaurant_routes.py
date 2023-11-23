from sqlite3 import OperationalError
from flask import Blueprint, jsonify, request, redirect, url_for, abort, current_app
from icecream import ic
import requests
import logging
from flask_caching import Cache
from werkzeug.datastructures import CombinedMultiDict
from sqlalchemy.orm import joinedload
from sqlalchemy import func, distinct, or_, desc
from sqlalchemy.exc import SQLAlchemyError
from http import HTTPStatus
import json
from flask_login import current_user, login_user, logout_user, login_required
from collections import OrderedDict
from ..models import User, ReviewImg, Review, db, MenuItem, MenuItemImg, Restaurant
from ..forms import RestaurantForm, ReviewForm, ReviewImgForm, MenuItemForm
from ..schemas import RestaurantSchema, ReviewSchema
from .. import helper_functions as hf


# Set up logging to capture error messages and other logs.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

restaurant_routes = Blueprint('restaurants', __name__)


# ***************************************************************
# Endpoint to Get All Restaurants
# ***************************************************************
@restaurant_routes.route('/all', methods=['GET'])
def get_all_restaurants():
    """
    Retrieve all restaurants from the database with pagination and normalize the data.
    Query Parameters:
        - page (int): The page number for pagination.
        - per_page (int): The number of items to display per page.
    Returns:
        Response: A JSON object with normalized restaurant data or an error message.
    """
    logger.info("Received request to fetch all restaurants.")

    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        if page < 1 or per_page < 1:
            raise ValueError("Page number and per_page must be greater than 0")

        pagination = Restaurant.query.paginate(page=page, per_page=per_page, error_out=False)
       

        all_restaurants_list = [restaurant.to_dict() for restaurant in pagination.items]
        normalized_restaurants = hf.normalize_data(all_restaurants_list, 'id')

        response = {
            "restaurants": normalized_restaurants,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "current_page": page
        }

        return jsonify(response)

    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error: {e}", extra={"page": page, "per_page": per_page})
        return jsonify({"error": "Database query failed", "details": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR
    except ValueError as e:
        logger.error(f"Value error: {e}", extra={"page": page, "per_page": per_page})
        return jsonify({"error": "Invalid input", "details": str(e)}), HTTPStatus.BAD_REQUEST
    except KeyError as e:
        logger.error(f"Key error in data normalization: {e}")
        return jsonify({"error": "Key error in processing data", "details": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR


# ***************************************************************
# Endpoint to Get All Nearby Restaurants
# ***************************************************************
@restaurant_routes.route('/nearby', methods=['GET'])
def get_nearby_restaurants():
    """
    Retrieve nearby restaurants from multiple sources: UberEats, Google Places, and a local database.

    Returns:
        Response: A JSON list of aggregated nearby restaurants or an error message.
    """
    logger.info("Received request to fetch nearby restaurants.")

    # Extract latitude, longitude, city name, state, and country from the request parameters.
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')
    city_name = request.args.get('city')
    state_name = request.args.get('state')
    country_name = request.args.get('country')

    # Convert the extracted values to float
    if latitude:
        latitude = float(latitude)
    if longitude:
        longitude = float(longitude)


    logger.info(f"Parameters received - city_name: {city_name}, state_name: {state_name}, country_name: {country_name}")

    # If both latitude and longitude aren't provided but city is, then attempt geocoding.
    if not latitude or not longitude:
        if city_name:
            coordinates = hf.get_coordinates_from_geocoding_service(city_name, current_app.config['MAPS_API_KEY'])
            if coordinates:
                latitude = coordinates['latitude']
                longitude = coordinates['longitude']
            else:
                # If geocoding fails, fetch restaurants from the database using city, state, and country.
                aggregated_results = hf.fetch_local_db_data(city_name, state_name, country_name)
                if aggregated_results:
                    return jsonify(aggregated_results)
                else:
                    return jsonify({"error": "Failed to get coordinates for the provided city and no restaurants found in the database for this city."}), 400
        else:
            return jsonify({"error": "Latitude, longitude, or city name must be provided."}), 400
    # If latitude and longitude are provided, aggregate data based on coordinates.
    if latitude and longitude:
        aggregated_results = hf.aggregate_restaurant_data_by_coordinates(latitude, longitude)
    # If city is provided (without latitude and longitude), aggregate data based on city, state, and country.
    elif city_name:
        aggregated_results = hf.aggregate_restaurant_data_by_city_state_country(city_name, state_name, country_name)

    # Return aggregated results or an error if no restaurants were found.
    if not aggregated_results:
        return jsonify({"error": "No restaurants found nearby."}), 404

    # Normalize the aggregated results
    normalized_results = hf.normalize_data(aggregated_results, 'id')

    return jsonify(normalized_results)



# ***************************************************************
# Endpoint to Get Restaurants of Current User
# ***************************************************************
@restaurant_routes.route('/owned')
def get_owned_restaurants():
    """
    Retrieves the restaurants owned by the currently logged-in user.

    Returns:
        Response: A dictionary of restaurants that the current user owns in a normalized structure.
    """
    try:
        # Fetching all restaurants owned by the current user
        owned_restaurants = Restaurant.query.filter_by(owner_id=current_user.id).all()

        # Convert the restaurants to a list of dictionaries
        restaurants_list = [restaurant.to_dict() for restaurant in owned_restaurants]

        # Normalize the list
        normalized_results = hf.normalize_data(restaurants_list, 'id')
        print("***********normalized_results: ", normalized_results)
        return jsonify(normalized_results)

    except OperationalError as oe:
        # Database operational errors (failed SQL query)
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500
    except Exception as e:
        # General errors (unexpected data issues)
        print(e)
        return jsonify({"error": "An error occurred while fetching the restaurants."}), 500

# ***************************************************************
# Endpoint to Get Details of a Restaurant by Id or Google Place Id
# ***************************************************************
@restaurant_routes.route('/<string:id>')
def get_restaurant_detail(id):
    """
    Fetches detailed information of a specific restaurant.
    If the restaurant is associated with UberEats, the function will fetch data from the UberEats API.
    Otherwise, it will fetch data from the local database.

    Args:
        id (str): The ID or Google Place ID of the restaurant.

    Returns:
        Response: Detailed information of the specified restaurant or an error message if not found.
    """
    try:
        # Check if id is a digit
        if id.isdigit():
            restaurant = Restaurant.query.get(int(id))
        else:
            restaurant = Restaurant.query.filter_by(google_place_id=id).first()

        # If found in the database and associated with an UberEats store_id
        if restaurant and hasattr(restaurant, 'ubereats_store_id') and restaurant.ubereats_store_id:
            access_token = hf.get_uber_access_token()
            ubereats_data = hf.fetch_from_ubereats_api_by_store_id(restaurant.ubereats_store_id, access_token)
            if ubereats_data:
                return jsonify(ubereats_data)  # Return data directly from UberEats

        # If not available on UberEats or doesn't have a store_id, fetch data from the database
        if restaurant is None:
            return jsonify({"error": "Restaurant details not found."}), 404

        # Use the helper function to fetch menu items for the restaurant
        menu_data = hf.fetch_menu_items_for_restaurant(restaurant.id)

        # Extracting the owner of the restaurant
        owner = restaurant.owner.to_dict()
        restaurant_list = [restaurant.to_dict()]
        normalized_restaurant = hf.normalize_data(restaurant_list, 'id')

        normalized_data = {
            "entities": {
                "restaurants": normalized_restaurant,
                "menuItems": menu_data["entities"]["menuItems"],
                "menuItemImages": menu_data["entities"]["menuItemImages"],
                "types": menu_data["entities"]["types"],
                "owner": owner
            }
        }

        return jsonify(normalized_data)

    except OperationalError as oe:
        # Database operational errors (failed SQL query)
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500
    except Exception as e:
        # General errors (unexpected data issues)
        print(e)
        return jsonify({"error": "An error occurred while fetching restaurant detail."}), 500

# ***************************************************************
# Endpoint to Edit a Restaurant's Details
# ***************************************************************
@restaurant_routes.route('/<int:id>', methods=["PUT"])
def update_restaurant(id):
    """
    Updates the details of a specific restaurant.

    Args:
        id (int): The ID of the restaurant to be updated.

    Returns:
        Response: A message indicating the success or failure of the update.
    """
    try:
        # Fetching the restaurant with the provided ID
        restaurant_to_update = Restaurant.query.get(id)

        # Check if the restaurant exists
        if restaurant_to_update is None:
            return jsonify({"error": "Restaurant not found."}), 404

        # Ensure the user is authenticated
        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        # Check if the logged-in user is the owner of the restaurant
        if restaurant_to_update.owner_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        # Parsing and validating the form data
        form = RestaurantForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        data = request.get_json()

        # Update form fields with provided data
        for field, value in data.items():
            if hasattr(form, field):
                setattr(form, field, value)

        # Update restaurant attributes if validation succeeds
        if form.validate_on_submit():
            for field in form:
                setattr(restaurant_to_update, field.name, field.data)

            db.session.commit()

            return jsonify({
                "message": "Restaurant updated successfully",
                "entities": {
                    "restaurants": hf.normalize_data([restaurant_to_update.to_dict()], 'id')
                }
            }), 200
        else:
            print(form.errors)
            return jsonify(errors=form.errors), 400

    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the restaurant."}), 500

# ***************************************************************
# Endpoint to Create a New Restaurant
# ***************************************************************
@restaurant_routes.route('', methods=["POST"])
def create_restaurant():
    """
    Creates a new restaurant in the database.

    Returns:
        Response: A message indicating the success or failure of the creation.
    """
    try:
        data = request.get_json()
        # Ensure provided data is valid
        if not data:
            return jsonify(errors="Invalid data"), 400

        # Ensure the user is authenticated
        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        # Parsing and validating the form data
        form = RestaurantForm(data=data)
        form['csrf_token'].data = request.cookies['csrf_token']

        # Create a new restaurant entry if validation succeeds
        if form.validate_on_submit():
            new_restaurant = Restaurant()
            form.populate_obj(new_restaurant)
            new_restaurant.owner_id = current_user.id

            db.session.add(new_restaurant)
            db.session.commit()

            return jsonify({
                "message": "Restaurant successfully created",
                "entities": {
                    "restaurants": hf.normalize_data([new_restaurant.to_dict()], 'id')
                }
            }), 201
        return jsonify(errors=form.errors), 400

    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500

    except Exception as e:
        print(f"Error creating restaurant: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the restaurant."}), 500

# ***************************************************************
# Endpoint to Delete a Restaurant
# ***************************************************************
@restaurant_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_restaurant(id):
    restaurant = Restaurant.query.get(id)

    if not restaurant:
        return jsonify(error="Restaurant not found"), 404
    if current_user.id != restaurant.owner_id:
        return jsonify(error="Unauthorized to delete this restaurant"), 403

    try:
        db.session.delete(restaurant)
        db.session.commit()
        return jsonify({
            "message": "Restaurant deleted successfully",
            "deletedRestaurantId": id
        }), 200

    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Error deleting restaurant: {e}"), 500

# ***************************************************************
# Endpoint to Search Restaurants by Name
# ***************************************************************
@restaurant_routes.route('/search/<search_term>')
def search_restaurants(search_term):
    """
    Searches restaurants in the database based on a given term.

    Args:
        search_term (str): The term to search for in restaurant names.

    Returns:
        Response: A list of restaurants that match the search term.
    """
    restaurants = Restaurant.query.filter(Restaurant.name.ilike(f'%{search_term}%')).all()
    return jsonify([restaurant.to_dict() for restaurant in restaurants])

# ***************************************************************
# Endpoint to Fetch Detailed Restaurant Info from Google Places API
# ***************************************************************
@restaurant_routes.route('/details/<place_id>', methods=['GET'])
def get_detailed_restaurant(place_id):
    """
    Fetches detailed information about a restaurant from Google Places API.

    Args:
        place_id (str): The unique identifier for the place as returned by Google Places API.

    Returns:
        Response: Detailed information about the specified restaurant.
    """
    google_api_key = current_app.config['MAPS_API_KEY']
    endpoint = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&key={google_api_key}"

    response = requests.get(endpoint)
    data = response.json()

    restaurant = data.get('result', {})
    db_restaurant = Restaurant.query.filter_by(name=restaurant["name"]).first()

    if db_restaurant:
        enriched_data = {**restaurant, **db_restaurant.to_dict()}
    else:
        enriched_data = restaurant

    return jsonify(enriched_data)

# *************************************************************************************
# *******************************REVIEWS FOR RESTAURANTS*******************************
# *************************************************************************************


# ***************************************************************
# Endpoint to Get Reviews by Restaurant ID
# ***************************************************************
@restaurant_routes.route('/<int:id>/reviews')
def get_reviews_by_restaurant_id(id):
    """
    Fetches reviews associated with a specific restaurant.

    Args:
        id (int): The ID of the restaurant.

    Returns:
        Response: A collection of reviews, their images, and associated users for the specified restaurant.
    """
    try:
        reviews = (
            db.session.query(Review)
            .filter(Review.restaurant_id == id)
            .options(
                joinedload(Review.user),
                joinedload(Review.review_imgs)
            )
            .order_by(Review.created_at.desc())
            .all()
        )

        if not reviews:
            return jsonify({
                "entities": {
                    "reviews": {"allIds": [], "byId": {}},
                    "reviewImages": {"allIds": [], "byId": {}},
                    "users": {"allIds": [], "byId": {}}
                },
                "metadata": {
                    "totalReviews": 0
                }
            })


        # Extract review, user, and image details
        review_dicts, user_dicts, image_dicts = [], [], []
        for review in reviews:
            review_dict = review.to_dict()
            review_dict["review_img_ids"] = [img.id for img in review.review_imgs]
            review_dicts.append(review_dict)

            user_dict = review.user.to_dict()
            user_dicts.append(user_dict)

            for img in review.review_imgs:
                image_dicts.append(img.to_dict())

        normalized_reviews = hf.normalize_data(review_dicts, 'id')
        normalized_images = hf.normalize_data(image_dicts, 'id')
        normalized_users = hf.normalize_data(user_dicts, 'id')

        return jsonify({
            "entities": {
                "reviews": normalized_reviews,
                "reviewImages": normalized_images,
                "users": normalized_users
            },
            "metadata": {
                "totalReviews": len(normalized_reviews["allIds"])
            }
        })
    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while fetching the reviews."}), 500

# ***************************************************************
# Endpoint to Create a Review for a Restaurant
# ***************************************************************
@restaurant_routes.route('/<int:id>/reviews', methods=["POST"])
def create_review(id):
    """
    Allows users to create a new review for a specified restaurant.

    Args:
        id (int): The ID of the restaurant to review.

    Returns:
        Response: A message indicating the success or failure of the review creation.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify(errors="Invalid data"), 400
        # Ensure user is authenticated
        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        # Validate the incoming data with the form
        form = ReviewForm(data=data)
        form['csrf_token'].data = request.cookies['csrf_token']

        # If the form validates, create the new menu item
        if form.validate_on_submit():
            new_review = Review()
            form.populate_obj(new_review)
            new_review.user_id = current_user.id
            new_review.restaurant_id = id

            db.session.add(new_review)
            db.session.commit()

            user_info = current_user.to_dict()

            return jsonify({
                "message": "Review successfully created",
                "reviewId": new_review.id,
                "entities": {
                    "reviews": hf.normalize_data([new_review.to_dict()], 'id'),
                    "users": hf.normalize_data([user_info], 'id')
                }
            }), 201

        return jsonify(errors=form.errors), 400
    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500
    except Exception as e:
        print(f"Error creating review: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the review."}), 500


# ***************************************************************
# Endpoint to Fetch All Menu Items for a Restaurant by ID
# ***************************************************************
@restaurant_routes.route('/<int:id>/menu-items')
def get_menu_items_by_restaurant_id(id):
    """
    Retrieves all menu items for a specific restaurant.

    Args:
        id (int): The ID of the restaurant.

    Returns:
        Response: A collection of menu items and associated images for the specified restaurant.
    """
    try:
        # Use the helper function to fetch menu items for the restaurant
        menu_data = hf.fetch_menu_items_for_restaurant(id)

        return jsonify(menu_data)

    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while fetching the menu items."}), 500


# ***************************************************************
# Endpoint to Filter Menu Items by Type and Price Range
# ***************************************************************
@restaurant_routes.route('/<int:id>/menu-items/filter')
def filter_menu_items_by_type(id):
    """
    Retrieves filtered menu items for a specific restaurant based on type and price range.
    Args:
        id (int): The ID of the restaurant.
    Returns:
        Response: A collection of filtered menu items for the specified restaurant.
    """
    try:
        menu_item_types = request.args.getlist('type')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)

        ic('menu_item_type', menu_item_types)
        ic('min_price', min_price)
        ic('max_price', max_price)

        if not menu_item_types:
            return jsonify({"error": "Menu item type is required for filtering."}), 400

        # Fetch filtered menu items
        filtered_menu_data = hf.fetch_filtered_menu_items(id, menu_item_types, min_price, max_price)
        ic('filtered_menu_data', filtered_menu_data)

        # Fetch the images separately
        menu_item_ids = [item['id'] for item in filtered_menu_data]
        images = MenuItemImg.query.filter(MenuItemImg.menu_item_id.in_(menu_item_ids)).all()
        images_dict = {img.menu_item_id: img.to_dict() for img in images}

        # Combine menu items with their images
        for item in filtered_menu_data:
            item['images'] = images_dict.get(item['id'], [])

        return jsonify(filtered_menu_data)

    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while fetching the menu items."}), 500

# ***************************************************************
# Endpoint to Create a MenuItem Based on a Restaurant ID
# ***************************************************************
@restaurant_routes.route('/<int:id>/menu-items', methods=["POST"])
@login_required
def create_menu_item_by_restaurant_id(id):
    """
    Allows users to create a new menu item for a specified restaurant.

    Args:
        id (int): The ID of the restaurant to add the menu item to.

    Returns:
        Response: A message indicating the success or failure of the menu item creation.
                  On success, also returns the created menu item details.
    """
    try:
        # Extract data from request
        data = request.get_json()
        if not data:
            return jsonify(errors="Invalid data"), 400

        # Ensure user is authenticated
        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        # Validate the incoming data with the form
        form = MenuItemForm(data=data)
        form['csrf_token'].data = request.cookies['csrf_token']

        # If the form validates, create the new menu item
        if form.validate_on_submit():
            new_MenuItem = MenuItem()
            form.populate_obj(new_MenuItem)
            new_MenuItem.restaurant_id = id

            # Add and commit new menu item to database
            db.session.add(new_MenuItem)
            db.session.commit()

            return jsonify({
                "message": "Menu Item successfully created",
                "entities": {
                    "MenuItem": hf.normalize_data([new_MenuItem.to_dict()], 'id')
                }
            }), 201

        # Return form errors if validation fails
        return jsonify(errors=form.errors), 400

    # Handle database and other errors
    except OperationalError as oe:
        print(oe)
        return jsonify({"error": "Database operation failed. Please try again later."}), 500
    except Exception as e:
        print(f"Error creating menu item: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the menu item."}), 500
