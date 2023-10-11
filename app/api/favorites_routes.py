from flask import Blueprint, request, jsonify
from ..models import db, User, Restaurant

from flask import Blueprint, jsonify, request
from app.models import db, Favorite

favorite_routes = Blueprint('favorites', __name__)

# *******************************Get all favorites*******************************
@favorite_routes.route('/')
def get_favorites():
    """Retrieve all favorites."""
    favorites = Favorite.query.all()
    return jsonify([favorite.to_dict() for favorite in favorites])

# *******************************Create a favorite*******************************
@favorite_routes.route('/', methods=['POST'])
def create_favorite():
    """Create a new favorite."""
    data = request.json

    if not data.get('user_id') or not data.get('restaurant_id'):
        return {"error": "Missing required fields"}, 400

    new_favorite = Favorite(
        user_id=data['user_id'],
        restaurant_id=data['restaurant_id']
    )

    try:
        db.session.add(new_favorite)
        db.session.commit()
        return new_favorite.to_dict(), 201
    except Exception as e:
        db.session.rollback()
        return {"error": f"Favorite creation failed: {str(e)}"}, 500

# *******************************Delete a favorite*******************************
@favorite_routes.route('/<int:id>', methods=['DELETE'])
def delete_favorite(id):
    """Delete a favorite."""
    favorite = Favorite.query.get(id)

    if not favorite:
        return {"error": "Favorite not found"}, 404

    try:
        db.session.delete(favorite)
        db.session.commit()
        return '', 204  
    except Exception as e:
        db.session.rollback()
        return {"error": f"Favorite deletion failed: {str(e)}"}, 500


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
