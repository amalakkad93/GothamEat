from flask import Blueprint, jsonify
from flask_login import current_user, login_user, logout_user, login_required
from ..models import Review, ReviewImg, db
from ..s3 import remove_file_from_s3, S3_LOCATION
from ..helper_functions import (review_image_exists, associated_review_exists,
                                review_belongs_to_user, remove_image_from_s3,
                                upload_image, delete_image)

# Define the blueprint for review image routes
review_img_routes = Blueprint('review_imgs', __name__)

# ***************************************************************
# Endpoint to Delete a Specific Review Image by ID
# ***************************************************************
@review_img_routes.route('/<int:id>', methods=["DELETE"])
@login_required
def delete_review_image(id):
    """
    Deletes a specified review image.

    Args:
        id (int): The ID of the review image to be deleted.

    Returns:
        Response: A message indicating the success or failure of the image deletion.
    """

    # Callback to determine if the current user has permission to delete the image
    def has_permission(owner):
        """Check if the authenticated user has permission to delete the image."""
        return owner.id == current_user.id

    # Callback to retrieve the owner of the review image
    def get_owner(image_record):
        """Retrieve the owner (user) of the given review image."""
        return image_record.review.user

    # Utilize the generic delete_image function to handle image deletion process
    result = delete_image(id, ReviewImg, db, 'Review image', has_permission, get_owner)

    # Return appropriate response based on result status
    if result['status'] == "success":
        return jsonify(message=result["message"]), result["code"]
    else:
        return jsonify({"error": result["message"]}), result["code"]
