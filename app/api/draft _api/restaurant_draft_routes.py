# # *************************Final Restaurant Routes Draft*************************
# from flask import Blueprint, jsonify, request, redirect, url_for, abort, current_app
# import requests
# from sqlalchemy.orm import joinedload
# from sqlalchemy import func, distinct, or_, desc
# import json
# from flask_login import current_user, login_user, logout_user, login_required
# from collections import OrderedDict
# from ..models import User, Review, Review, db, MenuItem, MenuItemImg, Restaurant
# from ..forms import RestaurantForm, ReviewForm, MenuItemForm
# from ..schemas import RestaurantSchema, ReviewSchema
# from ..helper_functions import normalize_data

# restaurant_routes  = Blueprint('restaurants', __name__)

# # *******************************Get All Restaurants*******************************
# @restaurant_routes.route('/')
# def get_all_restaurants():
#     try:
#         page = request.args.get('page', 1, type=int)
#         per_page = request.args.get('per_page', 10, type=int)

#         restaurants = (
#             db.session.query(Restaurant)
#             .order_by(Restaurant.average_rating.desc())
#             .limit(per_page)
#             .offset((page - 1) * per_page)
#             .all()
#         )

#         if not restaurants:
#             return jsonify([])

#         restaurants_list = [restaurant.to_dict() for restaurant in restaurants]
#         normalized_restaurants = normalize_data(restaurants_list, 'id')

#         return jsonify(normalized_restaurants)

#     except Exception as e:
#         print(str(e))
#         return jsonify({"error": "An error occurred while fetching the restaurants."}), 500


# # *******************************Get Restaurants of Current User*******************************
# @restaurant_routes.route('/current')
# def get_restaurants_of_current_user():
#     try:
#         reviews = Review.query.filter_by(user_id=current_user.id).all()

#         restaurants_of_current_user = {review.restaurant_id: review.restaurant.to_dict() for review in reviews}

#         return jsonify({"Restaurants": restaurants_of_current_user})

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching the restaurants."}), 500

# # *******************************Get Details of a Restaurant by Id*******************************
# @restaurant_routes.route('/<int:id>')
# def get_restaurant_detail(id):
#     try:
#         restaurant = Restaurant.query.get(id)

#         if restaurant is None:
#             return jsonify({"error": "Restaurant not found."}), 404

#         menu_items = (MenuItem.query
#                       .options(joinedload(MenuItem.menu_item_imgs))
#                       .filter_by(restaurant_id=id)
#                       .all())

#         menu_items_list = [item.to_dict() for item in menu_items]
#         normalized_menu_items = normalize_data(menu_items_list, 'id')

#         images_list = [img.to_dict() for item in menu_items for img in item.menu_item_imgs]
#         normalized_images = normalize_data(images_list, 'id')

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

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching restaurant detail."}), 500


# # *******************************Edit a Restaurant*******************************
# @restaurant_routes.route('/<int:id>', methods=["PUT"])
# def update_restaurant(id):
#     try:
#         restaurant_to_update = Review.query.get(id)

#         if restaurant_to_update is None:
#             return jsonify({"error": "Restaurant not found."}), 404

#         if not current_user.is_authenticated:
#             return jsonify(message="You need to be logged in"), 401

#         if restaurant_to_update.owner_id != current_user.id:
#             return jsonify(message="Unauthorized"), 403

#         form = RestaurantForm()
#         form['csrf_token'].data = request.cookies['csrf_token']
#         data = request.get_json()

#         for field, value in data.items():
#             if hasattr(form, field):
#                 setattr(form, field, value)

#         if form.validate_on_submit():
#             for field in form:
#                 setattr(restaurant_to_update, field.name, field.data)

#             db.session.commit()

#             # return jsonify(message="Restaurant updated successfully"), 200
#             return jsonify({
#                 "message": "Restaurant updated successfully",
#                 "entities": {
#                     "restaurants": normalize_data([restaurant_to_update.to_dict()], 'id')
#                 }
#             }), 200

#         else:
#             return jsonify(errors=form.errors), 400

#     except Exception as e:
#         print(e)
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while updating the restaurant."}), 500

# # *******************************Create a Restaurant*******************************
# @restaurant_routes.route('/', methods=["POST"])
# def create_restaurant():
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify(errors="Invalid data"), 400

#         if not current_user.is_authenticated:
#             return jsonify(message="You need to be logged in"), 401

#         form = RestaurantForm(data=data)
#         form['csrf_token'].data = request.cookies['csrf_token']

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


#             # return jsonify({
#             #     "message": "Restaurant successfully created",
#             #     "restaurant": new_restaurant.to_dict()
#             # }), 201

#         return jsonify(errors=form.errors), 400

#     except Exception as e:
#         print(f"Error creating restaurant: {e}")
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while creating the restaurant."}), 500

# # *******************************Delete a Restaurant*******************************
# @restaurant_routes.route('/<int:id>', methods=['DELETE'])
# @login_required
# def delete_restaurant(id):
#     restaurant = Restaurant.query.get(id)

#     if not restaurant:
#         return jsonify(error="Restaurant not found"), 404
#     if current_user.id != restaurant.owner_id:
#         return jsonify(error="Unauthorized to delete this restaurant"), 403

#     try:
#         db.session.delete(restaurant)
#         db.session.commit()
#         return jsonify(message="Restaurant deleted successfully"), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify(error=f"Error deleting restaurant: {e}"), 500

# # *******************************Get Search Restaurant*******************************
# @restaurant_routes.route('/search/<search_term>')
# def search_restaurants(search_term):
#     restaurants = Restaurant.query.filter(Restaurant.name.ilike(f'%{search_term}%')).all()
#     return jsonify([restaurant.to_dict() for restaurant in restaurants])

# # *******************************Get Nearby Restaurants From Google Api Places*******************************
# @restaurant_routes.route('/nearby', methods=['GET'])
# def get_nearby_restaurants():
#     latitude = request.args.get('latitude')
#     longitude = request.args.get('longitude')

#     google_api_key = current_app.config['MAPS_API_KEY']
#     endpoint = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&radius=1500&type=restaurant&key={google_api_key}"

#     response = requests.get(endpoint)
#     data = response.json()

#     return jsonify(data['results'])



# # *************************************************************************************
# # *******************************REVIEWS FOR RESTAURANTS*******************************
# # *************************************************************************************

# # *******************************Get Reviews by Restaurant Id*******************************
# @restaurant_routes.route('/<int:id>/reviews')
# def get_reviews_by_restaurant_id(id):
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

#         review_dicts = []
#         image_dicts = []
#         user_dicts = []

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

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching the reviews."}), 500



# # *******************************Create a Review for a Restaurant*******************************
# @restaurant_routes.route('/<int:id>/reviews', methods=["POST"])
# def create_review(id):
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

#             # return jsonify({
#             #     "message": "Review successfully created",
#             #     "review": new_review.to_dict()
#             # }), 201

#             return jsonify({
#                 "message": "Review successfully created",
#                 "entities": {
#                     "reviews": normalize_data([new_review.to_dict()], 'id')
#                 }
#             }), 201

#         return jsonify(errors=form.errors), 400
#     except Exception as e:
#         print(f"Error creating review: {e}")
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while creating the review."}), 500

# # *************************************************************************************
# # *******************************MENU ITEMS FOR RESTAURANTS*******************************
# # *************************************************************************************

# # *******************************Get All Menu Items for a Restaurant By Id*******************************
# @restaurant_routes.route('/<int:id>/menu-items')
# def get_menu_items_by_restaurant_id(id):
#     try:
#         menu_items = (
#             db.session.query(MenuItem)
#             .filter(MenuItem.restaurant_id == id)
#             .options(joinedload(MenuItem.menu_item_imgs))
#             .all()
#         )

#         if not menu_items:
#             return jsonify({"MenuItems": []})

#         menu_items_list = [item.to_dict() for item in menu_items]
#         images_list = [img.to_dict() for item in menu_items for img in item.menu_item_imgs]

#         for item_dict, item in zip(menu_items_list, menu_items):
#             item_dict["menu_item_img_ids"] = [img.id for img in item.menu_item_imgs]

#         normalized_menu_items = normalize_data(menu_items_list, 'id')
#         normalized_images = normalize_data(images_list, 'id')

#         return jsonify({
#             "entities": {
#                 "menuItems": normalized_menu_items,
#                 "menuItemImages": normalized_images
#             }
#         })

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching the menu items."}), 500

# # *******************************Create a MenuItem Based on a Restaurant Id*******************************
# @restaurant_routes.route('/<int:id>/menu-items', methods=["POST"])
# @login_required
# def create_menu_item_by_restaurant_id(id):
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify(errors="Invalid data"), 400

#         if not current_user.is_authenticated:
#             return jsonify(message="You need to be logged in"), 401

#         form = MenuItemForm(data=data)
#         form['csrf_token'].data = request.cookies['csrf_token']

#         if form.validate_on_submit():
#             new_MenuItem = MenuItem()
#             form.populate_obj(new_MenuItem)
#             # new_MenuItem.owner_id = current_user.id
#             new_MenuItem.restaurant_id = id

#             db.session.add(new_MenuItem)
#             db.session.commit()

#             return jsonify({
#                 "message": "Menu Item successfully created",
#                 "entities": {
#                     "MenuItem": normalize_data([new_MenuItem.to_dict()], 'id')
#                 }
#             }), 201


#             # return jsonify({
#             #     "message": "Menu Item successfully created",
#             #     "MenuItem": new_MenuItem.to_dict()
#             # }), 201

#         return jsonify(errors=form.errors), 400

#     except Exception as e:
#         print(f"Error creating menu item: {e}")
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while creating the menu item."}), 500

# # def get_menu_items_by_restaurant_id(id):
# #     try:
# #         menu_items = MenuItem.query.filter(MenuItem.restaurant_id == id).all()

# #         if not menu_items:
# #             return jsonify({"MenuItems": []})

#     #     # Using the schema to serialize the data
#     #     menu_item_schema = MenuItemSchema(many=True)
#     #     all_menu_items_list = menu_item_schema.dump(menu_items)

#     #     return jsonify({"MenuItems": all_menu_items_list})

#     # except Exception as e:
#     #     print(e)
#     #     return jsonify({"error": "An error occurred while fetching the menu items."}), 500
# ****************************************************************************************************************************
# ******************************* End Of Final Restaurant Routes Draft*******************************
# ****************************************************************************************************************************




# *******************************Get All Restaurants*******************************
# @restaurant_routes.route('/')
# def get_all_restaurants():
#     try:
#         page = request.args.get('page', 1, type=int)
#         per_page = request.args.get('per_page', 10, type=int)

#         restaurants = (
#             db.session.query(Restaurant)
#             .order_by(Restaurant.average_rating.desc())
#             .limit(per_page)
#             .offset((page - 1) * per_page)
#             .all()
#         )

#         if not restaurants:
#             return jsonify([])

#         all_restaurants_list = [restaurant.to_dict() for restaurant in restaurants]
#         return jsonify({"Restaurants": all_restaurants_list})

#     except Exception as e:
#         print(str(e))
#         return jsonify({"error": "An error occurred while fetching the restaurants."}), 500


# # *******************************Get Restaurants of Current User*******************************
# @restaurant_routes.route('/current')
# def get_restaurants_of_current_user():
#     try:
#         restaurants = (db.session.query(Review)
#                        .options(joinedload(Review.reviews))
#                        .filter(Review.owner_id == current_user.id)
#                        .all())

#         all_restaurants_of_current_user_list = [restaurant.to_dict() for restaurant in restaurants]
#         return jsonify({"Restaurants": all_restaurants_of_current_user_list})

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching the restaurants."}), 500
# *******************************Get Details of a Restaurant by Id*******************************
# @restaurant_routes.route('/<int:id>')
# def get_restaurant_detail(id):
#     try:
#         restaurant = Restaurant.query.get(id)

#         if restaurant is None:
#             return jsonify({"error": "Restaurant not found."}), 404

#         menu_items = (MenuItem.query
#                       .options(joinedload(MenuItem.menu_item_imgs))
#                       .filter_by(restaurant_id=id)
#                       .all())

#         menu_items_list = [item.to_dict() for item in menu_items]

#         owner = restaurant.owner.to_dict()

#         restaurant_dict = restaurant.to_dict()
#         restaurant_dict["MenuItems"] = menu_items_list
#         restaurant_dict["Owner"] = owner

#         return jsonify(restaurant_dict)

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "An error occurred while fetching restaurant detail."}), 500
