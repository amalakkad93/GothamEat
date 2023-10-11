from flask import Blueprint, jsonify, request,redirect, url_for, abort, send_file
from sqlalchemy import func, distinct, or_, desc
from sqlalchemy.orm import joinedload
import app, json
from flask_login import current_user, login_user, logout_user, login_required
from ..models import User, Restaurant, Review, ReviewImg, db, MenuItem,MenuItemImg
from ..s3 import get_unique_filename, upload_file_to_s3, remove_file_from_s3, upload_file, allowed_file, ALLOWED_EXTENSIONS
from ..forms import ReviewForm, ReviewImgForm


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
