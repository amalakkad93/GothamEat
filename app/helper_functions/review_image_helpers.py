
from ..models import db
from flask import jsonify
from ..s3 import remove_file_from_s3, S3_LOCATION
# from flask_login import current_user

# =======Check image existence=======
def review_image_exists(image_id, ReviewImg):
    exists = db.session.query(db.exists().where(ReviewImg.id == image_id)).scalar()
    if not exists:
        raise ValueError("Review image with the given ID not found.")

# =======Validate associated review=======
def associated_review_exists(image_id, Review, ReviewImg):
    exists = db.session.query(db.exists().where(Review.id == ReviewImg.review_id)).scalar()
    if not exists:
        raise ValueError("Review associated with the image not found.")



# =======Confirm user ownership of the review=======
def review_belongs_to_user(image_id, ReviewImg, current_user):
    review_image = ReviewImg.query.get(image_id)
    if review_image is None:
        raise ValueError("Review image with the given ID not found.")

    # Assuming 'review_image.review' is the related review object
    if review_image.review.user_id != current_user.id:
        raise ValueError("You don't have permission to delete this review image.")



# =======Delete from S3 bucket=======
def remove_image_from_s3(image_path):
    if S3_LOCATION in image_path:
        success = remove_file_from_s3(image_path)
        if not success:
            raise ValueError("Failed to delete image from S3.")
