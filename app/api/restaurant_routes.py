from flask import Blueprint, jsonify, request,redirect, url_for, abort
from sqlalchemy.orm import joinedload
from sqlalchemy import func, distinct, or_, desc
import json
from flask_login import current_user, login_user, logout_user, login_required
from ..models import User, Restaurant, Review, db, MenuItem, MenuItemImg
from ..forms import RestaurantForm

restaurant_routes  = Blueprint('restaurants', __name__)


# *******************************Get All Restaurants*******************************
@restaurant_routes.route('/')
def get_all_restaurants():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        restaurants = db.session.query(Restaurant).limit(per_page).offset((page - 1) * per_page).all()

        all_restaurants_list = [restaurant.to_dict() for restaurant in restaurants]

        return jsonify(all_restaurants_list)

    except Exception as e:
        return jsonify({"error": "An error occurred while fetching the restaurants."}), 500

# *******************************Get Restaurants of Current User*******************************
@restaurant_routes.route('/current')
def get_restaurants_of_current_user():
    try:
        restaurants = (db.session.query(Restaurant)
                       .options(joinedload(Restaurant.reviews))
                       .filter(Restaurant.owner_id == current_user.id)
                       .all())

        all_restaurants_of_current_user_list = [restaurant.to_dict() for restaurant in restaurants]
        return jsonify({"Restaurants": all_restaurants_of_current_user_list})

    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while fetching the restaurants."}), 500

# *******************************Get Details of a Restaurant by Id*******************************
@restaurant_routes.route('/<int:id>')
def get_restaurant_detail(id):
    try:
        restaurant = Restaurant.query.get(id)

        if restaurant is None:
            return jsonify({"error": "Restaurant not found."}), 404

        menu_item_imgs = (db.session.query(MenuItemImg)
                        .join(MenuItem, MenuItem.id == MenuItemImg.menu_item_id)
                        .filter(MenuItem.restaurant_id == restaurant.id)
                        .all())
        menu_item_imgs_list = [img.to_dict() for img in menu_item_imgs]

        owner = restaurant.owner.to_dict()

        restaurant_dict = restaurant.to_dict()

        restaurant_dict["MenuItemImg"] = menu_item_imgs_list
        restaurant_dict["Owner"] = owner


        return jsonify(restaurant_dict)

    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while fetching restaurant detail."}), 500

# *******************************Edit a Restaurant*******************************
@restaurant_routes.route('/<int:id>', methods=["PUT"])
def update_restaurant(id):
    try:
        restaurant_to_update = Restaurant.query.get(id)

        if restaurant_to_update is None:
            return jsonify({"error": "Restaurant not found."}), 404

        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        if restaurant_to_update.owner_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        form = RestaurantForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        data = request.get_json()

        for field, value in data.items():
            if hasattr(form, field):
                setattr(form, field, value)

        if form.validate_on_submit():
            for field in form:
                setattr(restaurant_to_update, field.name, field.data)

            db.session.commit()
            return jsonify(message="Restaurant updated successfully"), 200
        else:
            return jsonify(errors=form.errors), 400

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the restaurant."}), 500

# *******************************Create a Restaurant*******************************
@restaurant_routes.route('/', methods=["POST"])
def create_restaurant():
    try:
        data = request.get_json()
        if not data:
            return jsonify(errors="Invalid data"), 400

        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        form = RestaurantForm(data=data)
        form['csrf_token'].data = request.cookies['csrf_token']

        if form.validate_on_submit():
            new_restaurant = Restaurant()
            form.populate_obj(new_restaurant)
            new_restaurant.owner_id = current_user.id

            db.session.add(new_restaurant)
            db.session.commit()

            return jsonify({
                "message": "Restaurant successfully created",
                "restaurant": new_restaurant.to_dict()
            }), 201

        return jsonify(errors=form.errors), 400
    except Exception as e:
        print(f"Error creating restaurant: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the restaurant."}), 500

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
        return jsonify(message="Restaurant deleted successfully"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Error deleting restaurant: {e}"), 500
