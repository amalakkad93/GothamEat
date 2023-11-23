from flask import Blueprint, request, jsonify
from ..models import db, User, Review
from app.models import db, Favorite

favorite_routes = Blueprint('favorites', __name__)

# ***************************************************************
# Endpoint to Create or Delete a Favorite
# ***************************************************************
@favorite_routes.route('/', methods=['POST'])
def create_or_delete_favorite():
    data = request.json
    if not data.get('user_id') or not data.get('restaurant_id'):
        return {"error": "Missing required fields"}, 400

    user_id = data['user_id']
    restaurant_id = data['restaurant_id']

    existing_favorite = Favorite.query.filter_by(user_id=user_id, restaurant_id=restaurant_id).first()
    if existing_favorite:
        try:
            db.session.delete(existing_favorite)
            db.session.commit()
            return {"action": "removed", "favorite": existing_favorite.to_dict()}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Favorite deletion failed: {str(e)}"}, 500

    new_favorite = Favorite(
        user_id=user_id,
        restaurant_id=restaurant_id
    )

    try:
        db.session.add(new_favorite)
        db.session.commit()
        return {"action": "added", "favorite": new_favorite.to_dict()}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": f"Favorite creation failed: {str(e)}"}, 500


# ***************************************************************
# Endpoint to Retrieve All Favorites
# ***************************************************************
@favorite_routes.route('/')
def get_favorites():
    """
    Get all favorites for a specific user.

    Returns:
        list: A list of all favorite objects in the database for a specific user.
    """
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify(error="User ID is required"), 400

    favorites = Favorite.query.filter_by(user_id=user_id).all()
    return jsonify([favorite.to_dict() for favorite in favorites])

# ***************************************************************
# Endpoint to Check if a Favorite Exists
# ***************************************************************
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
