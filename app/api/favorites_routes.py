from flask import Blueprint, request, jsonify
from ..models import db, User, Review
from app.models import db, Favorite

favorite_routes = Blueprint('favorites', __name__)

# ***************************************************************
# Endpoint to Retrieve All Favorites
# ***************************************************************
@favorite_routes.route('/')
def get_favorites():
    """
    Get all favorites.

    Returns:
        list: A list of all favorite objects in the database.
    """
    favorites = Favorite.query.all()
    return jsonify([favorite.to_dict() for favorite in favorites])

# ***************************************************************
# Endpoint to Create a New Favorite
# ***************************************************************
@favorite_routes.route('/', methods=['POST'])
def create_favorite():
    """
    Create a new favorite.

    Requires:
        user_id (int): The ID of the user.
        restaurant_id (int): The ID of the restaurant.

    Returns:
        dict: The newly created favorite object.
    """
    data = request.json

        # Check for required fields
    if not data.get('user_id') or not data.get('restaurant_id'):
        return {"error": "Missing required fields"}, 400

    user_id = data['user_id']
    restaurant_id = data['restaurant_id']

    # Check if the favorite already exists
    existing_favorite = Favorite.query.filter_by(user_id=user_id, restaurant_id=restaurant_id).first()
    if existing_favorite:
        return {"error": "Favorite already exists for this user and restaurant"}, 400

    # Create a new favorite object
    new_favorite = Favorite(
        user_id=user_id,
        restaurant_id=restaurant_id
    )

    # Try adding the favorite to the database
    try:
        db.session.add(new_favorite)
        db.session.commit()
        return new_favorite.to_dict(), 201
    except Exception as e:
        db.session.rollback()
        return {"error": f"Favorite creation failed: {str(e)}"}, 500

# ***************************************************************
# Endpoint to Delete a Specific Favorite
# ***************************************************************
@favorite_routes.route('/<int:id>', methods=['DELETE'])
def delete_favorite(id):
    """
    Delete a favorite by its ID.

    Args:
        id (int): The ID of the favorite to delete.

    Returns:
        str: An empty string with status code 204 if successful.
    """
    favorite = Favorite.query.get(id)

    # Check if favorite exists
    if not favorite:
        return {"error": "Favorite not found"}, 404

    # Try deleting the favorite from the database
    try:
        db.session.delete(favorite)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return {"error": f"Favorite deletion failed: {str(e)}"}, 500

@favorite_routes.route('/check', methods=['GET'])
def check_favorite():
    """
    Check if a favorite exists for a specific user and restaurant.

    Requires:
        user_id (int): The ID of the user.
        restaurant_id (int): The ID of the restaurant.

    Returns:
        dict: A response indicating whether the favorite exists.
    """
    user_id = request.args.get('user_id')
    restaurant_id = request.args.get('restaurant_id')

    # Check if a favorite exists with the given user_id and restaurant_id
    favorite = Favorite.query.filter_by(user_id=user_id, restaurant_id=restaurant_id).first()

    if favorite:
        return {"exists": True}
    else:
        return {"exists": False}


# @favorite_routes.route('/toggle', methods=['POST'])
# def toggle_favorite():
#     try:
#         data = request.json
#         user_id = data['userId']
#         restaurant_id = data['restaurantId']
#         user = User.query.get(user_id)
#         restaurant = Restaurant.query.get(restaurant_id)

#         if not user or not restaurant:
#             return jsonify(message='User or restaurant not found'), 404

#         if restaurant in user.favorites:
#             user.favorites.remove(restaurant)
#             db.session.commit()
#             return jsonify(message='Restaurant removed from favorites')
#         else:
#             user.favorites.append(restaurant)
#             db.session.commit()
#             return jsonify(message='Restaurant added to favorites')
#     except Exception as e:
#         print(str(e))
#         return jsonify(message='Internal server error'), 500
