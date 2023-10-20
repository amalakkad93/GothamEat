from ..models import db
from flask import jsonify
from ..s3 import remove_file_from_s3, S3_LOCATION
# from flask_login import current_user

# ***************************************************************
# Check Existence of Review Image
# ***************************************************************
def review_image_exists(image_id, ReviewImg):
    """
    Checks if a review image with the provided ID exists in the database.

    Args:
        image_id (int): The ID of the review image to check.
        ReviewImg (Model): The Review Image model.

    Raises:
        ValueError: If the review image with the given ID is not found.
    """
    exists = db.session.query(db.exists().where(ReviewImg.id == image_id)).scalar()
    if not exists:
        raise ValueError("Review image with the given ID not found.")

# ***************************************************************
# Validate Existence of Associated Review
# ***************************************************************
def associated_review_exists(image_id, Review, ReviewImg):
    """
    Checks if a review associated with the provided review image ID exists in the database.

    Args:
        image_id (int): The ID of the review image.
        Review (Model): The Review model.
        ReviewImg (Model): The Review Image model.

    Raises:
        ValueError: If the review associated with the image is not found.
    """
    exists = db.session.query(db.exists().where(Review.id == ReviewImg.review_id)).scalar()
    if not exists:
        raise ValueError("Review associated with the image not found.")

# ***************************************************************
# Confirm User Ownership of the Review
# ***************************************************************
def review_belongs_to_user(image_id, ReviewImg, current_user):
    """
    Checks if the provided user is the owner of the review associated with the given review image ID.

    Args:
        image_id (int): The ID of the review image.
        ReviewImg (Model): The Review Image model.
        current_user (User): The user object to check.

    Raises:
        ValueError: If the review image with the given ID is not found or if the user is not the owner.
    """
    review_image = ReviewImg.query.get(image_id)
    if review_image is None:
        raise ValueError("Review image with the given ID not found.")

    if review_image.review.user_id != current_user.id:
        raise ValueError("You don't have permission to delete this review image.")

# ***************************************************************
# Remove Image from Amazon S3 Bucket
# ***************************************************************
def remove_image_from_s3(image_path):
    """
    Removes an image from an Amazon S3 bucket based on the provided image path.

    Args:
        image_path (str): The path of the image to remove.

    Raises:
        ValueError: If the removal process fails.
    """
    if S3_LOCATION in image_path:
        success = remove_file_from_s3(image_path)
        if not success:
            raise ValueError("Failed to delete image from S3.")

