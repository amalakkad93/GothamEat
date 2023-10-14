from flask import Blueprint, jsonify
# from sqlalchemy import db
from flask_login import current_user, login_user, logout_user, login_required
from ..models import Review, ReviewImg, db
from ..s3 import remove_file_from_s3, S3_LOCATION
from ..helper_functions import review_image_exists, associated_review_exists, review_belongs_to_user, remove_image_from_s3, upload_image, delete_image

review_img_routes = Blueprint('review_imgs', __name__)

# *******************************Delete a Review Image*******************************
@review_img_routes.route('/<int:id>', methods=["DELETE"])
@login_required
def delete_review_image(id):

    # Callback to check if the current user has permission to delete the image
    def has_permission(owner):
        return owner.id == current_user.id

    # Callback to get the owner ID of the image
    def get_owner(image_record):
        return image_record.review.user

    result = delete_image(id, ReviewImg, db, 'Review image', has_permission, get_owner)
    if result['status'] == "success":
        return jsonify(message=result["message"]), result["code"]
    else:
        return jsonify({"error": result["message"]}), result["code"]
