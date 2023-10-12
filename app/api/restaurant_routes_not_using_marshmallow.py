# from flask import Blueprint, jsonify, request,redirect, url_for, abort
# from sqlalchemy.orm import joinedload
# from sqlalchemy import func, distinct, or_, desc
# import json
# from flask_login import current_user, login_user, logout_user, login_required
# from ..models import User, Review, Review, db, MenuItem, MenuItemImg
# from ..forms import RestaurantForm, ReviewForm
# from ..schemas import RestaurantSchema, ReviewSchema

# restaurant_routes  = Blueprint('restaurants', __name__)

# restaurant_schema = RestaurantSchema()
# review_schema = ReviewSchema()

# # *******************************Get All Restaurants*******************************
# @restaurant_routes.route('/')
# def get_all_restaurants():
#     try:
#         page = request.args.get('page', 1, type=int)
#         per_page = request.args.get('per_page', 10, type=int)

#         restaurants = (
#             db.session.query(Review)
#             .order_by(Review.average_rating.desc())
#             .limit(per_page)
#             .offset((page - 1) * per_page)
#             .all()
#         )

#         all_restaurants_list = [restaurant_schema.dump(restaurant) for restaurant in restaurants]

#         return jsonify(all_restaurants_list)

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

# # *******************************Get Details of a Restaurant by Id*******************************
# @restaurant_routes.route('/<int:id>')
# def get_restaurant_detail(id):
#     try:
#         restaurant = Review.query.get(id)

#         if restaurant is None:
#             return jsonify({"error": "Restaurant not found."}), 404

#         menu_item_imgs = (db.session.query(MenuItemImg)
#                         .join(MenuItem, MenuItem.id == MenuItemImg.menu_item_id)
#                         .filter(MenuItem.restaurant_id == restaurant.id)
#                         .all())
#         menu_item_imgs_list = [img.to_dict() for img in menu_item_imgs]

#         owner = restaurant.owner.to_dict()

#         restaurant_dict = restaurant.to_dict()

#         restaurant_dict["MenuItemImg"] = menu_item_imgs_list
#         restaurant_dict["Owner"] = owner


#         return jsonify(restaurant_dict)

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
#             return jsonify(message="Restaurant updated successfully"), 200
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
#             new_restaurant = Review()
#             form.populate_obj(new_restaurant)
#             new_restaurant.owner_id = current_user.id

#             db.session.add(new_restaurant)
#             db.session.commit()

#             return jsonify({
#                 "message": "Restaurant successfully created",
#                 "restaurant": new_restaurant.to_dict()
#             }), 201

#         return jsonify(errors=form.errors), 400
#     except Exception as e:
#         print(f"Error creating restaurant: {e}")
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while creating the restaurant."}), 500

# # *******************************Delete a Restaurant*******************************
# @restaurant_routes.route('/<int:id>', methods=['DELETE'])
# @login_required
# def delete_restaurant(id):
#     restaurant = Review.query.get(id)

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
#     restaurants = Review.query.filter(Review.name.ilike(f'%{search_term}%')).all()
#     return jsonify([restaurant.to_dict() for restaurant in restaurants])

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

#         all_reviews_list = [
#             {
#                 'id': review.id,
#                 'User': review.user.to_dict(),
#                 'ReviewImages': [{'id': img.id, 'url': img.image_path} for img in review.review_imgs]
#             }
#             for review in reviews
#         ]

#         return jsonify({"Reviews": all_reviews_list})

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

#             return jsonify({
#                 "message": "Review successfully created",
#                 "review": new_review.to_dict()
#             }), 201

#         return jsonify(errors=form.errors), 400
#     except Exception as e:
#         print(f"Error creating review: {e}")
#         db.session.rollback()
#         return jsonify({"error": "An error occurred while creating the review."}), 500
