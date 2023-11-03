
from flask import Blueprint, jsonify, request,redirect, url_for, abort, send_file, current_app
from sqlalchemy import func, distinct, or_, desc
from sqlalchemy.orm import joinedload
from collections import OrderedDict
import app, json
import traceback
import time
from flask_login import current_user, login_user, logout_user, login_required
from ..models import User, Review, ReviewImg, db, MenuItem, MenuItemImg
from ..s3 import get_unique_filename, upload_file_to_s3, remove_file_from_s3, upload_file, allowed_file, ALLOWED_EXTENSIONS
from ..forms import ReviewForm, ReviewImgForm
from .. import helper_functions as hf

review_routes = Blueprint('review', __name__)

# ***************************************************************
# Endpoint to Fetch Reviews of the Currently Logged-in User
# ***************************************************************
@review_routes.route('/current')
def get_reviews_of_current_user():
    """
    Fetches all reviews written by the currently logged-in user.

    Args:
        None

    Returns:
        Response: A list of reviews written by the current user or an error message if none found.
    """
    try:
        # Query the database for reviews associated with the current user
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

        # If no reviews found, return appropriate response
        if not reviews:
            return jsonify({"error": "No reviews found for the current user."}), 404

        # Extract and format the data for the response
        review_dicts, restaurant_dicts, image_dicts, user_dicts = [], [], [], []
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

        # Normalize the data for the response
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
        # Return a generalized error message for unexpected issues
        return jsonify({"error": "An error occurred while fetching the reviews."}), 500


# ***************************************************************
# Endpoint to Get Details of a Review by Id
# ***************************************************************
@review_routes.route('/<int:id>', methods=["GET"])
def get_review(id):
    """
    Retrieve the details of a specific review.

    Args:
        id (int): The ID of the review to fetch.

    Returns:
        Response: The review details or an error message in JSON format.
    """
    try:
        review = Review.query.get(id)
        if not review:
            return jsonify({"error": "Review not found."}), 404

        # Fetching related images
        review_images = ReviewImg.query.filter_by(review_id=id).all()
        image_paths = [img.image_path for img in review_images]

        # Convert the review to a dictionary and add image paths
        data_review = review.to_dict()
        data_review['image_paths'] = image_paths

        # Wrap the data review in a list for normalization
        data_list = [data_review]

        # Normalize the data
        normalized_data = hf.normalize_data(data_list, 'id')

        return jsonify(normalized_data), 200

    except Exception as e:
        app.logger.error(f"An error occurred while fetching review with ID {id}: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while fetching the review."}), 500


# ***************************************************************
# Endpoint to Update a Specific Review by ID
# ***************************************************************
@review_routes.route('/<int:id>', methods=["PUT"])
def update_review(id):
    """
    Updates a review based on the provided ID. Only the author of the review
    (or an admin) can update the review.

    Args:
        id (int): The ID of the review to be updated.

    Returns:
        Response: A message indicating the success or failure of the review update.
    """
    try:
        # Fetch the review to be updated
        review_to_update = Review.query.get(id)

        # Check if the review exists
        if review_to_update is None:
            return jsonify({"error": "Review not found."}), 404

        # Ensure user is authenticated
        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        # Ensure the current user is the author of the review
        if review_to_update.user_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        # Validate the incoming data
        form = ReviewForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        data = request.get_json()

        for field, value in data.items():
            if hasattr(form, field):
                setattr(form, field, value)

        # If data is valid, update the review
        if form.validate_on_submit():
            for field in form:
                setattr(review_to_update, field.name, field.data)

            db.session.commit()
            return jsonify(message="Review updated successfully"), 200
        else:
            # Return validation errors
            return jsonify(errors=form.errors), 400

    except Exception as e:
        print(e)
        db.session.rollback()
        # Return a generalized error message for unexpected issues
        return jsonify({"error": "An error occurred while updating the review."}), 500

# ***************************************************************
# Endpoint to Delete a Specific Review by ID
# ***************************************************************
@review_routes.route('/<int:id>', methods=["DELETE"])
def delete_review(id):
    """
    Deletes a review based on the provided ID. Only the author of the review
    (or an admin) can delete the review.

    Args:
        id (int): The ID of the review to be deleted.

    Returns:
        Response: A message indicating the success or failure of the review deletion.
    """
    try:
        # Fetch the review to be deleted
        review_to_delete = Review.query.get(id)

        # Check if the review exists
        if review_to_delete is None:
            return jsonify({"error": "Review not found."}), 404

        # Ensure the user is authenticated
        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        # Ensure the current user is the author of the review
        if review_to_delete.user_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        # Delete the review from the database
        db.session.delete(review_to_delete)
        db.session.commit()

        return jsonify(message="Review deleted successfully"), 200

    except Exception as e:
        print(e)
        db.session.rollback()
        # Handle unexpected errors
        return jsonify({"error": "An error occurred while deleting the review."}), 500

# ***************************************************************
# Endpoint to Upload a Review Image to AWS
# ***************************************************************
# @review_routes.route("/<int:review_id>/image", methods=["POST"])
# def upload_review_image(review_id):
#     """
#     Uploads an image for a specified review to AWS.

#     Args:
#         review_id (int): The ID of the review to which the image will be associated.

#     Returns:
#         Response: A message indicating the success or failure of the image upload.
#     """
#     try:
#         # Initialize and set up the form for image upload
#         form = ReviewImgForm()
#         form['csrf_token'].data = request.cookies['csrf_token']

#         # If form data is valid, proceed to upload the image
#         if form.validate_on_submit():
#             return upload_image(form.image.data, form.image_url.data, ReviewImg, review_id, db)
#         else:
#             # Return validation errors
#             return jsonify({"errors": form.errors}), 400
#     except Exception as e:
#         print("Error uploading image:", traceback.format_exc())
#         # Handle unexpected errors during image upload
#         return jsonify({"error": "An error occurred while uploading the image."}), 500
@review_routes.route("/<int:review_id>/images", methods=["POST"])
def upload_review_image(review_id):
    """
    Stores the image URL for a specified review.
    """
    try:
        data = request.get_json()
        image_url = data.get("image_url")
        if not image_url:
            return jsonify({"error": "Image URL is required."}), 400

        # Assuming you might want to delete existing images for the review as in Code 1
        existing_images = ReviewImg.query.filter_by(review_id=review_id).all()
        for img in existing_images:
            db.session.delete(img)

        new_image = ReviewImg(review_id=review_id, image_path=image_url)
        db.session.add(new_image)
        db.session.commit()

        # Log the success and include the image ID in the response
        print("Sending image data:", {"status": "success", "image_url": image_url, "id": new_image.id})
        return jsonify({
            "status": "success",
            "image_url": image_url,
            "id": new_image.id,  # Include this line to return the ID
            "code": 201
        }), 201

        # new_image = ReviewImg(review_id=review_id, image_path=image_url)
        # db.session.add(new_image)
        # db.session.commit()

        # return jsonify({"status": "success", "image_url": image_url, "code": 201}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error in upload_review_image: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while storing the image URL."}), 500

# @review_routes.route("/<int:review_id>/image", methods=["POST"])
# def upload_review_image(review_id):
#     """
#     Uploads an image for a specified review to AWS.

#     Args:
#         review_id (int): The ID of the review to which the image will be associated.

#     Returns:
#         Response: A message indicating the success or failure of the image upload.
#     """
#     start_time = time.time()

#     try:
#         # Initialize and set up the form for image upload
#         form_start_time = time.time()
#         form = ReviewImgForm()
#         form['csrf_token'].data = request.cookies['csrf_token']
#         form_end_time = time.time()
#         current_app.logger.info(f"Time taken for form initialization: {form_end_time - form_start_time} seconds")

#         validation_start_time = time.time()
#         if form.validate_on_submit():
#             validation_end_time = time.time()
#             current_app.logger.info(f"Time taken for form validation: {validation_end_time - validation_start_time} seconds")

#             upload_start_time = time.time()
#             response = upload_image(form.image.data, form.image_url.data, ReviewImg, review_id, db)
#             upload_end_time = time.time()
#             current_app.logger.info(f"Time taken for image upload: {upload_end_time - upload_start_time} seconds")

#             return response
#         else:
#             validation_end_time = time.time()
#             current_app.logger.info(f"Time taken for form validation: {validation_end_time - validation_start_time} seconds")

#             # Return validation errors
#             return jsonify({"errors": form.errors}), 400

#     except Exception as e:
#         print("Error uploading image:", traceback.format_exc())
#         # Handle unexpected errors during image upload
#         return jsonify({"error": "An error occurred while uploading the image."}), 500
#     finally:
#         end_time = time.time()
#         current_app.logger.info(f"Total time for upload_review_image: {end_time - start_time} seconds")

# ***************************************************************
# Endpoint to Retrieve a Review Image from AWS by Review ID
# ***************************************************************
@review_routes.route("/<int:review_id>/images")
def get_review_image(review_id):
    """
    Fetches the image associated with a specific review from AWS.

    Args:
        review_id (int): The ID of the review whose image is to be fetched.

    Returns:
        Response: The image file or an error message indicating that the image was not found.
    """
    # Query the database for the image associated with the given review
    review_image = ReviewImg.query.filter_by(review_id=review_id).first()

    if review_image and review_image.image_path:
        # Extract the filename from the image path
        filename = review_image.image_path.rsplit("/", 1)[-1]

        # Return the image file to the client
        return send_file(review_image.image_path, as_attachment=True, attachment_filename=filename)

    # Return an error if no image found
    return "Image not found", 404
