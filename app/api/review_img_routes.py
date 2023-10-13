from flask import Blueprint, jsonify
# from sqlalchemy import db
from flask_login import current_user, login_user, logout_user, login_required
from ..models import Review, ReviewImg, db
from ..s3 import remove_file_from_s3, S3_LOCATION
from ..helper_functions import review_image_exists, associated_review_exists, review_belongs_to_user, remove_image_from_s3

review_img_routes = Blueprint('review_imgs', __name__)

# *******************************Delete a Review Image*******************************
@review_img_routes.route('/<int:id>', methods=["DELETE"])
@login_required
def delete_review_image(id):
    try:
        review_image_exists(id, ReviewImg)
        associated_review_exists(id, Review, ReviewImg)

        review_image_record = ReviewImg.query.get(id)

        # Check if the associated review belongs to the current user
        if review_image_record.review.user_id != current_user.id:
            raise ValueError("You don't have permission to delete this review image.")

        if review_image_record:
            remove_image_from_s3(review_image_record.image_path)

        db.session.query(ReviewImg).filter(ReviewImg.id == id).delete()
        db.session.commit()

        return jsonify(message="Review image deleted successfully"), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({"error": "An error occurred while deleting the review image."}), 500
