from flask import Blueprint, jsonify, request,redirect, url_for, abort, send_file
from sqlalchemy import func, distinct, or_, desc
from sqlalchemy.orm import joinedload
from collections import OrderedDict
import app, json
from flask_login import current_user, login_user, logout_user, login_required
from ..models import User, Review, ReviewImg, db, MenuItem, MenuItemImg
from ..s3 import get_unique_filename, upload_file_to_s3, remove_file_from_s3, upload_file, allowed_file, ALLOWED_EXTENSIONS
from ..forms import ReviewForm, ReviewImgForm


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

        all_reviews_of_current_user_list = [
            {
                'id': review.id,
                'User': review.user.to_dict() if review.user else None,
                'Restaurant': review.restaurant.to_dict() if review.restaurant else None,
                'ReviewImages': [{'id': img.id, 'url': img.image_path} for img in review.review_imgs]
            }
            for review in reviews
        ]

        return jsonify({"Reviews": all_reviews_of_current_user_list}), 200

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
        json_data = request.get_json()

        image = json_data.get('image')
        image_url = json_data.get('image_url')

        print("Image:", image)
        print("Image URL:", image_url)

        if image or image_url:
            if image and allowed_file(image.filename):
                image_url = upload_file_to_s3(image, app.config["S3_BUCKET"])

                review_image = ReviewImg(review_id=review_id, image_path=image_url)
                db.session.add(review_image)
                db.session.commit()

                return jsonify({"image_url": image_url}), 201

            elif image_url:
                review_image = ReviewImg(review_id=review_id, image_path=image_url)
                db.session.add(review_image)
                db.session.commit()

                return jsonify({"image_url": image_url}), 201

        return jsonify({"error": "Image or image URL is required."}), 400

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while uploading the image."}), 500


# *******************************Get Review Image From AWS*******************************
@review_routes.route("/<int:review_id>/image")
def get_review_image(review_id):
    review_image = ReviewImg.query.filter_by(review_id=review_id).first()

    if review_image and review_image.image_path:
        filename = review_image.image_path.rsplit("/", 1)[-1]

        return send_file(review_image.image_path, as_attachment=True, attachment_filename=filename)

    return "Image not found", 404
