# from sqlite3 import OperationalError
# from flask import Blueprint, jsonify, request, redirect, url_for, abort, current_app
# import requests
# from flask_caching import Cache

# from sqlalchemy.orm import joinedload
# from sqlalchemy import func, distinct, or_, desc
# import json
# from flask_login import current_user, login_user, logout_user, login_required
# from collections import OrderedDict
# from ..models import User, Review, Review, db, MenuItem, MenuItemImg, Restaurant
# from ..forms import RestaurantForm, ReviewForm, MenuItemForm
# from ..schemas import RestaurantSchema, ReviewSchema
# from ..helper_functions import normalize_data, map_google_place_to_restaurant_model, get_address_components_from_geocoding, get_uber_access_token, fetch_from_ubereats_api_by_store_id, fetch_from_ubereats_by_location, map_ubereats_to_restaurant_model

# restaurant_routes = Blueprint('restaurants', __name__)

# # ***************************************************************
# # Endpoint to Get All Restaurants
# # ***************************************************************
# @restaurant_routes.route('/')
# def get_all_restaurants():
#     """
#     Fetches and returns a list of all restaurants stored in the database.
#     Results can be paginated by providing 'page' and 'per_page' parameters.

#     Returns:
#         Response: A list of restaurants or an error message in case of failure.
#     """
#     try:
#         page = request.args.get('page', 1, type=int)
#         per_page = request.args.get('per_page', 10, type=int)

#         # Fetching restaurants, ordered by their average rating
#         restaurants = (
#             db.session.query(Restaurant)
#             .order_by(Restaurant.average_rating.desc())
#             .limit(per_page)
#             .offset((page - 1) * per_page)
#             .all()
#         )

#         if not restaurants:
#             return jsonify([])

#         # Convert each restaurant into a dictionary format for easy serialization
#         restaurants_list = [restaurant.to_dict() for restaurant in restaurants]
#         normalized_restaurants = normalize_data(restaurants_list, 'id')

#         return jsonify(normalized_restaurants)

#     except OperationalError as oe:
#         # Database operational errors (e.g., failed SQL query)
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500
#     except Exception as e:
#         # General errors (e.g., unexpected data issues)
#         print(str(e))
#         return jsonify({"error": "An error occurred while fetching the restaurants."}), 500

# # ***************************************************************
# # Endpoint to Get Restaurants of Current User
# # ***************************************************************
# @restaurant_routes.route('/current')
# def get_restaurants_of_current_user():
#     """
#     Retrieves the restaurants that have been reviewed by the currently logged-in user.

#     Returns:
#         Response: A dictionary of restaurants that the current user has reviewed.
#     """
#     try:
#         # Fetching all reviews made by the current user
#         reviews = Review.query.filter_by(user_id=current_user.id).all()

#         # Extracting restaurants that the current user has reviewed
#         restaurants_of_current_user = {review.restaurant_id: review.restaurant.to_dict() for review in reviews}

#         return jsonify({"Restaurants": restaurants_of_current_user})

#     except OperationalError as oe:
#         # Database operational errors (e.g., failed SQL query)
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500
#     except Exception as e:
#         # General errors (e.g., unexpected data issues)
#         print(e)
#         return jsonify({"error": "An error occurred while fetching the restaurants."}), 500

# # ***************************************************************
# # Endpoint to Get Details of a Restaurant by Id
# # ***************************************************************
# # @restaurant_routes.route('/<int:id>')
# # def get_restaurant_detail(id):
# #     """
# #     Fetches detailed information of a specific restaurant, including menu items, images, and owner details.

# #     Args:
# #         id (int): The ID of the restaurant to retrieve details for.

# #     Returns:
# #         Response: Detailed information of the specified restaurant or an error message if not found.
# #     """
# #     try:
# #         # Fetching the restaurant with the provided ID
# #         restaurant = Restaurant.query.get(id)

# #         if restaurant is None:
# #             return jsonify({"error": "Restaurant not found."}), 404

# #         # Fetching menu items associated with the restaurant
# #         menu_items = (MenuItem.query
# #                       .options(joinedload(MenuItem.menu_item_imgs))
# #                       .filter_by(restaurant_id=id)
# #                       .all())

# #         # Converting menu items to dictionary format for serialization
# #         menu_items_list = [item.to_dict() for item in menu_items]
# #         normalized_menu_items = normalize_data(menu_items_list, 'id')

# #         # Extracting images associated with the menu items
# #         images_list = [img.to_dict() for item in menu_items for img in item.menu_item_imgs]
# #         normalized_images = normalize_data(images_list, 'id')

# #         # Extracting the owner of the restaurant
# #         owner = restaurant.owner.to_dict()
# #         restaurant_list = [restaurant.to_dict()]
# #         normalized_restaurant = normalize_data(restaurant_list, 'id')

# #         normalized_data = {
# #             "entities": {
# #                 "restaurants": normalized_restaurant,
# #                 "menuItems": normalized_menu_items,
# #                 "menuItemImgs": normalized_images,
# #                 "owner": owner
# #             }
# #         }

# #         return jsonify(normalized_data)

# #     except OperationalError as oe:
# #         # Database operational errors (e.g., failed SQL query)
# #         print(oe)
# #         return jsonify({"error": "Database operation failed. Please try again later."}), 500
# #     except Exception as e:
# #         # General errors (e.g., unexpected data issues)
# #         print(e)
# #         return jsonify({"error": "An error occurred while fetching restaurant detail."}), 500

# # ***************************************************************
# # Endpoint to Get Details of a Restaurant by Google Place Id
# # ***************************************************************
# # @restaurant_routes.route('/<string:id>')
# # def get_restaurant_detail(id):
# #     """
# #     Fetches detailed information of a specific restaurant using its Google Place ID.
# #     If the restaurant is associated with UberEats, the function will fetch data from the UberEats API.

# #     Args:
# #         id (str): The Google Place ID of the restaurant.

# #     Returns:
# #         Response: Detailed information of the specified restaurant or an error message if not found.
# #     """
# #     try:
# #         # First, attempt to fetch the restaurant from the database using the primary key
# #         restaurant = Restaurant.query.get(id)

# #         # If not found by primary key, try using google_place_id
# #         if restaurant is None:
# #             restaurant = Restaurant.query.filter_by(google_place_id=id).first()

# #         # If found in the database and associated with an UberEats store_id
# #         if restaurant and hasattr(restaurant, 'ubereats_store_id') and restaurant.ubereats_store_id:
# #             access_token = get_uber_access_token()
# #             ubereats_data = fetch_from_ubereats_api_by_store_id(restaurant.ubereats_store_id, access_token)
# #             if ubereats_data:
# #                 return jsonify(ubereats_data)  # Return data directly from UberEats

# #         # If not available on UberEats or doesn't have a store_id, fetch data from the database
# #         if restaurant is None:
# #             return jsonify({"error": "Restaurant details not found."}), 404

# #         # Extracting menu items associated with the restaurant
# #         menu_items = (MenuItem.query
# #                       .options(joinedload(MenuItem.menu_item_imgs))
# #                       .filter_by(restaurant_id=restaurant.id)
# #                       .all())

# #         # Converting menu items to dictionary format for serialization
# #         menu_items_list = [item.to_dict() for item in menu_items]
# #         normalized_menu_items = normalize_data(menu_items_list, 'id')

# #         # Extracting images associated with the menu items
# #         images_list = [img.to_dict() for item in menu_items for img in item.menu_item_imgs]
# #         normalized_images = normalize_data(images_list, 'id')

# #         # Extracting the owner of the restaurant
# #         owner = restaurant.owner.to_dict()
# #         restaurant_list = [restaurant.to_dict()]
# #         normalized_restaurant = normalize_data(restaurant_list, 'id')

# #         normalized_data = {
# #             "entities": {
# #                 "restaurants": normalized_restaurant,
# #                 "menuItems": normalized_menu_items,
# #                 "menuItemImgs": normalized_images,
# #                 "owner": owner
# #             }
# #         }

# #         return jsonify(normalized_data)

# #     except OperationalError as oe:
# #         # Database operational errors (e.g., failed SQL query)
# #         print(oe)
# #         return jsonify({"error": "Database operation failed. Please try again later."}), 500
# #     except Exception as e:
# #         # General errors (e.g., unexpected data issues)
# #         print(e)
# #         return jsonify({"error": "An error occurred while fetching restaurant detail."}), 500

# # ***************************************************************
# # Endpoint to Get Details of a Restaurant by Id or Google Place Id
# # ***************************************************************
# @restaurant_routes.route('/<string:id>')
# def get_restaurant_detail(id):
#     """
#     Fetches detailed information of a specific restaurant.
#     If the restaurant is associated with UberEats, the function will fetch data from the UberEats API.
#     Otherwise, it will fetch data from the local database.

#     Args:
#         id (str): The ID or Google Place ID of the restaurant.

#     Returns:
#         Response: Detailed information of the specified restaurant or an error message if not found.
#     """
#     try:
#         # Attempt to fetch the restaurant from the database using primary key
#         restaurant = Restaurant.query.get(id)

#         # If not found by primary key, try using google_place_id
#         if restaurant is None:
#             restaurant = Restaurant.query.filter_by(google_place_id=id).first()

#         # If found in the database and associated with an UberEats store_id
#         if restaurant and hasattr(restaurant, 'ubereats_store_id') and restaurant.ubereats_store_id:
#             access_token = get_uber_access_token()
#             ubereats_data = fetch_from_ubereats_api_by_store_id(restaurant.ubereats_store_id, access_token)
#             if ubereats_data:
#                 return jsonify(ubereats_data)  # Return data directly from UberEats

#         # If not available on UberEats or doesn't have a store_id, fetch data from the database
#         if restaurant is None:
#             return jsonify({"error": "Restaurant details not found."}), 404

#         # Extracting menu items associated with the restaurant
#         menu_items = (MenuItem.query
#                       .options(joinedload(MenuItem.menu_item_imgs))
#                       .filter_by(restaurant_id=restaurant.id)
#                       .all())

#         # Converting menu items to dictionary format for serialization
#         menu_items_list = [item.to_dict() for item in menu_items]
#         normalized_menu_items = normalize_data(menu_items_list, 'id')

#         # Extracting images associated with the menu items
#         images_list = [img.to_dict() for item in menu_items for img in item.menu_item_imgs]
#         normalized_images = normalize_data(images_list, 'id')

#         # Extracting the owner of the restaurant
#         owner = restaurant.owner.to_dict()
#         restaurant_list = [restaurant.to_dict()]
#         normalized_restaurant = normalize_data(restaurant_list, 'id')

#         normalized_data = {
#             "entities": {
#                 "restaurants": normalized_restaurant,
#                 "menuItems": normalized_menu_items,
#                 "menuItemImgs": normalized_images,
#                 "owner": owner
#             }
#         }

#         return jsonify(normalized_data)

#     except OperationalError as oe:
#         # Database operational errors (e.g., failed SQL query)
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500
#     except Exception as e:
#         # General errors (e.g., unexpected data issues)
#         print(e)
#         return jsonify({"error": "An error occurred while fetching restaurant detail."}), 500


# # ***************************************************************
# # Endpoint to Edit a Restaurant's Details
# # ***************************************************************
# @restaurant_routes.route('/<int:id>', methods=["PUT"])
# def update_restaurant(id):
#     """
#     Updates the details of a specific restaurant.

#     Args:
#         id (int): The ID of the restaurant to be updated.

#     Returns:
#         Response: A message indicating the success or failure of the update.
#     """
#     try:
#         # Fetching the restaurant with the provided ID
#         restaurant_to_update = Review.query.get(id)

#         # Check if the restaurant exists
#         if restaurant_to_update is None:
#             return jsonify({"error": "Restaurant not found."}), 404

#         # Ensure the user is authenticated
#         if not current_user.is_authenticated:
#             return jsonify(message="You need to be logged in"), 401

#         # Check if the logged-in user is the owner of the restaurant
#         if restaurant_to_update.owner_id != current_user.id:
#             return jsonify(message="Unauthorized"), 403

#         # Parsing and validating the form data
#         form = RestaurantForm()
#         form['csrf_token'].data = request.cookies['csrf_token']
#         data = request.get_json()

#         # Update form fields with provided data
#         for field, value in data.items():
#             if hasattr(form, field):
#                 setattr(form, field, value)

#         # Update restaurant attributes if validation succeeds
#         if form.validate_on_submit():
#             for field in form:
#                 setattr(restaurant_to_update, field.name, field.data)

#             db.session.commit()

#             return jsonify({
#                 "message": "Restaurant updated successfully",
#                 "entities": {
#                     "restaurants": normalize_data([restaurant_to_update.to_dict()], 'id')
#                 }
#             }), 200
#         else:
#             return jsonify(errors=form.errors), 400

#     except OperationalError as oe:
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500

#     except Exception as e:
#         print(e)
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while updating the restaurant."}), 500

# # ***************************************************************
# # Endpoint to Create a New Restaurant
# # ***************************************************************
# @restaurant_routes.route('/', methods=["POST"])
# def create_restaurant():
#     """
#     Creates a new restaurant in the database.

#     Returns:
#         Response: A message indicating the success or failure of the creation.
#     """
#     try:
#         data = request.get_json()
#         # Ensure provided data is valid
#         if not data:
#             return jsonify(errors="Invalid data"), 400

#         # Ensure the user is authenticated
#         if not current_user.is_authenticated:
#             return jsonify(message="You need to be logged in"), 401

#         # Parsing and validating the form data
#         form = RestaurantForm(data=data)
#         form['csrf_token'].data = request.cookies['csrf_token']

#         # Create a new restaurant entry if validation succeeds
#         if form.validate_on_submit():
#             new_restaurant = Restaurant()
#             form.populate_obj(new_restaurant)
#             new_restaurant.owner_id = current_user.id

#             db.session.add(new_restaurant)
#             db.session.commit()

#             return jsonify({
#                 "message": "Restaurant successfully created",
#                 "entities": {
#                     "restaurants": normalize_data([new_restaurant.to_dict()], 'id')
#                 }
#             }), 201
#         return jsonify(errors=form.errors), 400

#     except OperationalError as oe:
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500

#     except Exception as e:
#         print(f"Error creating restaurant: {e}")
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while creating the restaurant."}), 500

# # ***************************************************************
# # Endpoint to Delete a Restaurant
# # ***************************************************************
# @restaurant_routes.route('/<int:id>', methods=['DELETE'])
# @login_required
# def delete_restaurant(id):
#     """
#     Deletes a specific restaurant from the database.

#     Args:
#         id (int): The ID of the restaurant to be deleted.

#     Returns:
#         Response: A message indicating the success or failure of the deletion.
#     """
#     restaurant = Restaurant.query.get(id)

#     # Check for the existence of the restaurant and authorization
#     if not restaurant:
#         return jsonify(error="Restaurant not found"), 404
#     if current_user.id != restaurant.owner_id:
#         return jsonify(error="Unauthorized to delete this restaurant"), 403

#     try:
#         db.session.delete(restaurant)
#         db.session.commit()
#         return jsonify(message="Restaurant deleted successfully"), 200
#     except OperationalError as oe:
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500
#     except Exception as e:
#         db.session.rollback()
#         return jsonify(error=f"Error deleting restaurant: {e}"), 500

# # ***************************************************************
# # Endpoint to Search Restaurants by Name
# # ***************************************************************
# @restaurant_routes.route('/search/<search_term>')
# def search_restaurants(search_term):
#     """
#     Searches restaurants in the database based on a given term.

#     Args:
#         search_term (str): The term to search for in restaurant names.

#     Returns:
#         Response: A list of restaurants that match the search term.
#     """
#     restaurants = Restaurant.query.filter(Restaurant.name.ilike(f'%{search_term}%')).all()
#     return jsonify([restaurant.to_dict() for restaurant in restaurants])

# # ***************************************************************
# # Endpoint to Fetch Nearby Restaurants from UberEats
# # ***************************************************************
# @restaurant_routes.route('/nearby', methods=['GET'])
# def get_nearby_restaurants():
#     """
#     Fetches nearby restaurants based on user's location from UberEats.

#     Returns:
#         Response: A list of nearby restaurants from UberEats.
#     """
#     latitude = request.args.get('latitude')
#     longitude = request.args.get('longitude')

#     # Check for latitude and longitude parameters
#     if not latitude or not longitude:
#         return jsonify({"error": "Latitude and Longitude are required"}), 400

#     access_token = get_uber_access_token()
#     restaurants_from_ubereats = fetch_from_ubereats_by_location(latitude, longitude, access_token)

#     if not restaurants_from_ubereats:
#         return jsonify({"error": "Failed to fetch data from UberEats."}), 500

#     mapped_data = [map_ubereats_to_restaurant_model(restaurant) for restaurant in restaurants_from_ubereats]
#     return jsonify(mapped_data)

# # # ***************************************************************
# # # Endpoint to Fetch Nearby Restaurants from Google Places API
# # # ***************************************************************
# # @restaurant_routes.route('/nearby', methods=['GET'])
# # def get_nearby_restaurants():
# #     """
# #     Fetches nearby restaurants based on user's location from Google Places API.

# #     Returns:
# #         Response: A list of nearby restaurants from Google Places.
# #     """
# #     latitude = request.args.get('latitude')
# #     longitude = request.args.get('longitude')

# #     # Check for latitude and longitude parameters
# #     if not latitude or not longitude:
# #         return jsonify({"error": "Latitude and Longitude are required"}), 400

# #     google_api_key = current_app.config['MAPS_API_KEY']
# #     endpoint = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&radius=1500&type=restaurant&key={google_api_key}"

# #     response = requests.get(endpoint)
# #     data = response.json()

# #     if response.status_code != 200 or data.get('status', '') != "OK":
# #         error_message = data.get('error_message', 'Unknown error from Google API')
# #         return jsonify({"error": f"Google API Error: {data.get('status', '')}. Message: {error_message}"}), 500

# #     enriched_data = []
# #     for restaurant in data['results']:
# #         mapped_data = map_google_place_to_restaurant_model(restaurant)
# #         db_restaurant = Restaurant.query.filter_by(name=restaurant["name"]).first()
# #         if db_restaurant:
# #             enriched_data.append({**mapped_data, **db_restaurant.to_dict()})
# #         else:
# #             enriched_data.append(mapped_data)

# #     return jsonify(enriched_data)

# # ***************************************************************
# # Endpoint to Fetch Detailed Restaurant Info from Google Places API
# # ***************************************************************
# @restaurant_routes.route('/details/<place_id>', methods=['GET'])
# def get_detailed_restaurant(place_id):
#     """
#     Fetches detailed information about a restaurant from Google Places API.

#     Args:
#         place_id (str): The unique identifier for the place as returned by Google Places API.

#     Returns:
#         Response: Detailed information about the specified restaurant.
#     """
#     google_api_key = current_app.config['MAPS_API_KEY']
#     endpoint = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&key={google_api_key}"

#     response = requests.get(endpoint)
#     data = response.json()

#     restaurant = data.get('result', {})
#     db_restaurant = Restaurant.query.filter_by(name=restaurant["name"]).first()

#     if db_restaurant:
#         enriched_data = {**restaurant, **db_restaurant.to_dict()}
#     else:
#         enriched_data = restaurant

#     return jsonify(enriched_data)

# # *************************************************************************************
# # *******************************REVIEWS FOR RESTAURANTS*******************************
# # *************************************************************************************


# # ***************************************************************
# # Endpoint to Get Reviews by Restaurant ID
# # ***************************************************************
# @restaurant_routes.route('/<int:id>/reviews')
# def get_reviews_by_restaurant_id(id):
#     """
#     Fetches reviews associated with a specific restaurant.

#     Args:
#         id (int): The ID of the restaurant.

#     Returns:
#         Response: A collection of reviews, their images, and associated users for the specified restaurant.
#     """
#     try:
#         reviews = (
#             db.session.query(Review)
#             .filter(Review.restaurant_id == id)
#             .options(
#                 joinedload(Review.user),
#                 joinedload(Review.review_imgs)
#             )
#             .all()
#         )

#         if not reviews:
#             return jsonify({"Reviews": []})

#         # Extract review, user, and image details
#         review_dicts, user_dicts, image_dicts = [], [], []
#         for review in reviews:
#             review_dict = review.to_dict()
#             review_dict["review_img_ids"] = [img.id for img in review.review_imgs]
#             review_dicts.append(review_dict)

#             user_dict = review.user.to_dict()
#             user_dicts.append(user_dict)

#             for img in review.review_imgs:
#                 image_dicts.append(img.to_dict())

#         normalized_reviews = normalize_data(review_dicts, 'id')
#         normalized_images = normalize_data(image_dicts, 'id')
#         normalized_users = normalize_data(user_dicts, 'id')

#         return jsonify({
#             "entities": {
#                 "reviews": normalized_reviews,
#                 "reviewImages": normalized_images,
#                 "users": normalized_users
#             },
#             "metadata": {
#                 "totalReviews": len(normalized_reviews["allIds"])
#             }
#         })
#     except OperationalError as oe:
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500
#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching the reviews."}), 500

# # ***************************************************************
# # Endpoint to Create a Review for a Restaurant
# # ***************************************************************
# @restaurant_routes.route('/<int:id>/reviews', methods=["POST"])
# def create_review(id):
#     """
#     Allows users to create a new review for a specified restaurant.

#     Args:
#         id (int): The ID of the restaurant to review.

#     Returns:
#         Response: A message indicating the success or failure of the review creation.
#     """
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify(errors="Invalid data"), 400
#         if not current_user.is_authenticated:
#             return jsonify(message="You need to be logged in"), 401

#         form = ReviewForm(data=data)
#         form['csrf_token'].data = request.cookies['csrf_token']

#         if form.validate_on_submit():
#             new_review = Review()
#             form.populate_obj(new_review)
#             new_review.user_id = current_user.id
#             new_review.restaurant_id = id

#             db.session.add(new_review)
#             db.session.commit()

#             return jsonify({
#                 "message": "Review successfully created",
#                 "entities": {
#                     "reviews": normalize_data([new_review.to_dict()], 'id')
#                 }
#             }), 201

#         return jsonify(errors=form.errors), 400
#     except OperationalError as oe:
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500
#     except Exception as e:
#         print(f"Error creating review: {e}")
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while creating the review."}), 500

# # ***************************************************************
# # Endpoint to Fetch All Menu Items for a Restaurant by ID
# # ***************************************************************
# @restaurant_routes.route('/<int:id>/menu-items')
# def get_menu_items_by_restaurant_id(id):
#     """
#     Retrieves all menu items for a specific restaurant.

#     Args:
#         id (int): The ID of the restaurant.

#     Returns:
#         Response: A collection of menu items and associated images for the specified restaurant.
#     """
#     try:
#         menu_items = (
#             db.session.query(MenuItem)
#             .filter(MenuItem.restaurant_id == id)
#             .options(joinedload(MenuItem.menu_item_imgs))
#             .all()
#         )

#         if not menu_items:
#             return jsonify({"MenuItems": []})

#         # Extract menu items and their images
#         menu_items_list, images_list = [], []
#         for item in menu_items:
#             item_dict = item.to_dict()
#             item_dict["menu_item_img_ids"] = [img.id for img in item.menu_item_imgs]
#             menu_items_list.append(item_dict)

#             for img in item.menu_item_imgs:
#                 images_list.append(img.to_dict())

#         normalized_menu_items = normalize_data(menu_items_list, 'id')
#         normalized_images = normalize_data(images_list, 'id')

#         return jsonify({
#             "entities": {
#                 "menuItems": normalized_menu_items,
#                 "menuItemImages": normalized_images
#             }
#         })
#     except OperationalError as oe:
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500
#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching the menu items."}), 500


# # ***************************************************************
# # Endpoint to Create a MenuItem Based on a Restaurant ID
# # ***************************************************************
# @restaurant_routes.route('/<int:id>/menu-items', methods=["POST"])
# @login_required
# def create_menu_item_by_restaurant_id(id):
#     """
#     Allows users to create a new menu item for a specified restaurant.

#     Args:
#         id (int): The ID of the restaurant to add the menu item to.

#     Returns:
#         Response: A message indicating the success or failure of the menu item creation.
#                   On success, also returns the created menu item details.
#     """
#     try:
#         # Extract data from request
#         data = request.get_json()
#         if not data:
#             return jsonify(errors="Invalid data"), 400

#         # Ensure user is authenticated
#         if not current_user.is_authenticated:
#             return jsonify(message="You need to be logged in"), 401

#         # Validate the incoming data with the form
#         form = MenuItemForm(data=data)
#         form['csrf_token'].data = request.cookies['csrf_token']

#         # If the form validates, create the new menu item
#         if form.validate_on_submit():
#             new_MenuItem = MenuItem()
#             form.populate_obj(new_MenuItem)
#             new_MenuItem.restaurant_id = id

#             # Add and commit new menu item to database
#             db.session.add(new_MenuItem)
#             db.session.commit()

#             return jsonify({
#                 "message": "Menu Item successfully created",
#                 "entities": {
#                     "MenuItem": normalize_data([new_MenuItem.to_dict()], 'id')
#                 }
#             }), 201

#         # Return form errors if validation fails
#         return jsonify(errors=form.errors), 400

#     # Handle database and other errors
#     except OperationalError as oe:
#         print(oe)
#         return jsonify({"error": "Database operation failed. Please try again later."}), 500
#     except Exception as e:
#         print(f"Error creating menu item: {e}")
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while creating the menu item."}), 500
