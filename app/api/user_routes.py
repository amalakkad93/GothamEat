from flask import Blueprint, jsonify, current_app
from flask_login import login_required
from app.models import User, Shipping


user_routes = Blueprint('users', __name__)


@user_routes.route('/')
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    users = User.query.all()
    return {'users': [user.to_dict() for user in users]}


@user_routes.route('/<int:id>')
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    user = User.query.get(id)
    return user.to_dict()

@user_routes.route('/<int:user_id>/shippings', methods=['GET'])
def get_user_shippings(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        shippings = Shipping.query.filter_by(user_id=user_id).all()
        return jsonify([shipping.to_dict() for shipping in shippings]), 200 if shippings else jsonify({'message': 'No shipping information available for this user.'}), 200
    except Exception as e:
        # Log the exception for debugging
        current_app.logger.error(f'An error occurred when fetching shippings for user {user_id}: {e}')
        return jsonify({'error': 'An unexpected error occurred'}), 500
