from flask import Blueprint, jsonify
from sqlalchemy import db
from flask_login import current_user, login_user, logout_user, login_required
from ..models import Review, ReviewImg
from ..s3 import remove_file_from_s3, S3_LOCATION

review_img_routes = Blueprint('review_imgs', __name__)

# *******************************Delete a Review Image*******************************
@review_img_routes.route('/<int:id>', methods=["DELETE"])
@login_required
def delete_review_image(id):
    try:
        review_image_exists(id)
        associated_review_exists(id)
        review_belongs_to_user(id)

        review_image_record = ReviewImg.query.get(id)
        if review_image_record:
            remove_image_from_s3(review_image_record.image_path)

        db.session.query(ReviewImg).filter(ReviewImg.id == id).delete()
        db.session.commit()

        return jsonify(message="Review image deleted successfully"), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while deleting the review image."}), 500

#  *******************************Helper Functions*******************************
def review_image_exists(image_id):
    exists = db.session.query(db.exists().where(ReviewImg.id == image_id)).scalar()
    if not exists:
        raise ValueError("Review image with the given ID not found.")

def associated_review_exists(image_id):
    exists = db.session.query(db.exists().where(Review.id == ReviewImg.review_id)).scalar()
    if not exists:
        raise ValueError("Review associated with the image not found.")

def review_belongs_to_user(image_id):
    exists = db.session.query(db.exists().where(Review.user_id == current_user.id)).scalar()
    if not exists:
        raise ValueError("You don't have permission to delete this review image.")

def remove_image_from_s3(image_path):
    if S3_LOCATION in image_path:
        success = remove_file_from_s3(image_path)
        if not success:
            raise ValueError("Failed to delete image from S3.")


# @review_img_routes.route('/<int:id>', methods=["DELETE"])
# @login_required
# def delete_review_image(id):

#     review_image_exists = db.session.query(db.exists().where(ReviewImg.id == id)).scalar()
#     if not review_image_exists:
#         return jsonify({"error": "Review image with the given ID not found."}), 404

#     review_exists = db.session.query(db.exists().where(Review.id == ReviewImg.review_id)).scalar()
#     if not review_exists:
#         return jsonify({"error": "Review associated with the image not found."}), 404

#     review_belongs_to_user = db.session.query(db.exists().where(Review.user_id == current_user.id)).scalar()
#     if not review_belongs_to_user:
#         return jsonify({"error": "You don't have permission to delete this review image."}), 403

#     review_image_record = ReviewImg.query.get(id)

#     if review_image_record:
#         image_url = review_image_record.image_path

#         if S3_LOCATION in image_url:
#             success = remove_file_from_s3(image_url)
#             if not success:
#                 return jsonify({"error": "Failed to delete image from S3."}), 500

#     db.session.query(ReviewImg).filter(ReviewImg.id == id).delete()
#     db.session.commit()

#     return jsonify(message="Review image deleted successfully"), 200
