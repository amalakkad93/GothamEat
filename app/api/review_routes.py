from flask import Blueprint, jsonify, request,redirect, url_for, abort, send_file
from sqlalchemy import func, distinct, or_, desc
from sqlalchemy.orm import joinedload
from collections import OrderedDict
import app, json
import traceback
from flask_login import current_user, login_user, logout_user, login_required
from ..models import User, Review, ReviewImg, db, MenuItem, MenuItemImg
from ..s3 import get_unique_filename, upload_file_to_s3, remove_file_from_s3, upload_file, allowed_file, ALLOWED_EXTENSIONS
from ..forms import ReviewForm, ReviewImgForm
from ..helper_functions import normalize_data, handle_image_upload


review_routes = Blueprint('review', __name__)



# *******************************Get Reviews of Current User*******************************
@review_routes.route('/current')
def get_reviews_of_current_user():
    try:
        reviews = (
            db.session.query(Review)
            .filter(Review.user_id == current_user.id)
            .options(
                joinedload(Review.user),
                joinedload(Review.restaurant),
                joinedload(Review.review_imgs)
            )
            .all()
        )

        if not reviews:
            return jsonify({"error": "No reviews found for the current user."}), 404

        review_dicts = []
        restaurant_dicts = []
        image_dicts = []
        user_dicts = []

        for review in reviews:
            review_dict = review.to_dict()
            review_dict["review_img_ids"] = [img.id for img in review.review_imgs]
            review_dicts.append(review_dict)

            if review.restaurant:
                restaurant_dicts.append(review.restaurant.to_dict())

            if review.user:
                user_dicts.append(review.user.to_dict())

            for img in review.review_imgs:
                image_dicts.append(img.to_dict())

        normalized_reviews = normalize_data(review_dicts, 'id')
        normalized_restaurants = normalize_data(restaurant_dicts, 'id')
        normalized_images = normalize_data(image_dicts, 'id')
        normalized_users = normalize_data(user_dicts, 'id')

        return jsonify({
            "entities": {
                "reviews": normalized_reviews,
                "restaurants": normalized_restaurants,
                "reviewImages": normalized_images,
                "users": normalized_users
            }
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while fetching the reviews."}), 500



# *******************************Edit a Review*******************************
@review_routes.route('/<int:id>', methods=["PUT"])
def update_review(id):
    try:
        review_to_update = Review.query.get(id)

        if review_to_update is None:
            return jsonify({"error": "Review not found."}), 404

        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        if review_to_update.user_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        form = ReviewForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        data = request.get_json()

        for field, value in data.items():
            if hasattr(form, field):
                setattr(form, field, value)

        if form.validate_on_submit():
            for field in form:
                setattr(review_to_update, field.name, field.data)

            db.session.commit()
            return jsonify(message="Review updated successfully"), 200
        else:
            return jsonify(errors=form.errors), 400

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the review."}), 500

# *******************************Delete a Review*******************************
@review_routes.route('/<int:id>', methods=["DELETE"])
def delete_review(id):
    try:
        review_to_delete = Review.query.get(id)

        if review_to_delete is None:
            return jsonify({"error": "Review not found."}), 404

        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        if review_to_delete.user_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        db.session.delete(review_to_delete)
        db.session.commit()

        return jsonify(message="Review deleted successfully"), 200

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": "An error occurred while deleting the review."}), 500


# *******************************Upload Review Image to AWS*******************************
@review_routes.route("/<int:review_id>/image", methods=["POST"])
def upload_review_image(review_id):
    try:
        form = ReviewImgForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        print("Form data:", form.data)
        print("Form errors:", form.errors)

        if form.validate_on_submit():
            return handle_image_upload(form.image.data, form.image_url.data, ReviewImg, review_id, db)
        else:
            return jsonify({"errors": form.errors}), 400
    except Exception as e:
        print("Error uploading image:", traceback.format_exc())
        return jsonify({"error": "An error occurred while uploading the image."}), 500


# *******************************Get Review Image From AWS*******************************
@review_routes.route("/<int:review_id>/image")
def get_review_image(review_id):
    review_image = ReviewImg.query.filter_by(review_id=review_id).first()

    if review_image and review_image.image_path:
        filename = review_image.image_path.rsplit("/", 1)[-1]

        return send_file(review_image.image_path, as_attachment=True, attachment_filename=filename)

    return "Image not found", 404
