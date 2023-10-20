# from flask import Blueprint, render_template, redirect, jsonify, request
# from flask_login import login_required
# from ..s3 import get_unique_filename, upload_file_to_s3, remove_file_from_s3, ALLOWED_EXTENSIONS, upload_file
# from ..models import User, Review, Review, db, MenuItem, MenuItemImg, ReviewImg
# # from ..forms import RestaurantForm, ReviewForm, ImageForm


# image_routes = Blueprint("images", __name__)

# # *******************************Upload Menu Item Image*******************************
# @image_routes.route("/upload_menu_item_image", methods=["POST"])
# def upload_menu_item_image():

#     image = request.files.get("image")

#     if not image:
#         return jsonify({"error": "No image provided"}), 400

#     upload_result = upload_file_to_s3(image)

#     if "url" in upload_result:
#         image_url = upload_result["url"]

#         new_image = MenuItemImg(image_path=image_url)
#         db.session.add(new_image)
#         db.session.commit()

#         return jsonify({"url": image_url}), 201

#     return jsonify({"error": "Failed to upload image"}), 500


# # *******************************Upload Review Image*******************************
# @image_routes.route("/upload_review_image", methods=["POST"])
# def upload_review_image():
#     image = request.files.get("image")

#     if not image:
#         return jsonify({"error": "No image provided"}), 400

#     upload_result = upload_file_to_s3(image)

#     if "url" in upload_result:
#         image_url = upload_result["url"]

#         new_image = ReviewImg(image_path=image_url)
#         db.session.add(new_image)
#         db.session.commit()

#         return jsonify({"url": image_url}), 201

#     return jsonify({"error": "Failed to upload image"}), 500

# @image_routes.route("", methods=["POST"])
# @login_required
# def upload_image():
#     form = ImageForm()

#     if form.validate_on_submit():
#         image = form.data["image"]
#         image.filename = get_unique_filename(image.filename)
#         upload = upload_file_to_s3(image)
#         print(upload)
#         if "url" not in upload:
#             return render_template("post_form.html", form=form, errors=[upload])
#         url = upload["url"]
#         new_image = Post(image=url)
#         db.session.add(new_image)
#         db.session.commit()
#         return redirect("/posts/all")

#     if form.errors:
#         print(form.errors)
#         return render_template("post_form.html", form=form, errors=form.errors)

#     return render_template("post_form.html", form=form, errors=None)
