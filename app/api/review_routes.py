from flask import Blueprint, jsonify, request,redirect, url_for, abort
import app
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, Restaurant, Review, db, MenuItem,MenuItemImg
from sqlalchemy import func, distinct, or_, desc
from sqlalchemy.orm import joinedload

import json

review_routes = Blueprint('review', __name__)



# *******************************Get Reviews of Current User*******************************
@review_routes.route('/current')
def get_reviews_of_current_user():
    try:
        reviews = db.session.query(Review).filter(Review.user_id == current_user.id).all()


        all_reviews_of_current_user_list = [review.to_dict() for review in reviews]
        return jsonify({"Reviews": all_reviews_of_current_user_list})

    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while fetching the reviews."}), 500
