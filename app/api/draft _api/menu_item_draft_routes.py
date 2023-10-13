# from flask import Blueprint, jsonify, request,redirect, url_for, abort, send_file
# import app
# from flask_login import current_user, login_user, logout_user, login_required
# from sqlalchemy import func, distinct, or_, desc
# from ..models import User, Review, Review, db, MenuItem, MenuItemImg
# from ..s3 import get_unique_filename, upload_file_to_s3, remove_file_from_s3, ALLOWED_EXTENSIONS, upload_file, allowed_file
# from ..forms import MenuItemForm, MenuItemImgForm
# import json

# menu_item_routes = Blueprint('menu_items', __name__)
# below it works but it is not using the helper function
# # *******************************Upload Menu Item Image to AWS*******************************
# @menu_item_routes.route("/<int:menu_item_id>/images", methods=["POST"])
# @login_required
# def upload_menu_item_image(menu_item_id):
#     try:
#         form = MenuItemImgForm()
#         form.image.data = request.files.get('image')
#         form.image_url.data = request.form.get('image_url')
#         form['csrf_token'].data = request.cookies['csrf_token']
#         print("Form data:", form.data)
#         print("Form errors:", form.errors)

#         if form.validate_on_submit():
#             if form.image.data and allowed_file(form.image.data.filename):
#                 result = upload_file_to_s3(form.image.data)

#                 if result.get("status") == "success":
#                     image_url = result.get("url")
#                     menu_item_image = MenuItemImg(menu_item_id=menu_item_id, image_path=image_url)
#                     db.session.add(menu_item_image)
#                     db.session.commit()
#                     return jsonify({"image_url": image_url}), 201
#                 else:
#                     print(f"Error from S3: {result.get('message')}")
#                     return jsonify({"error": "Failed to upload image to S3."}), 500

#             elif form.image_url.data:
#                 menu_item_image = MenuItemImg(menu_item_id=menu_item_id, image_path=form.image_url.data)
#                 db.session.add(menu_item_image)
#                 db.session.commit()
#                 return jsonify({"image_url": form.image_url.data}), 201

#         else:
#             return jsonify({"errors": form.errors}), 400

#     except Exception as e:
#         print("Error uploading image:", traceback.format_exc())
#         return jsonify({"error": "An error occurred while uploading the image."}), 500

# # *******************************Upload Menu Item Image to AWS*******************************
# @menu_item_routes.route("/<int:menu_item_id>/image", methods=["POST"])
# def upload_menu_item_image(menu_item_id):
#     try:
#         json_data = request.get_json()

#         image = json_data.get('image')
#         image_url = json_data.get('image_url')

#         print("Image:", image)
#         print("Image URL:", image_url)

#         if image or image_url:
#             if image and allowed_file(image.filename):
#                 image_url = upload_file_to_s3(image, app.config["S3_BUCKET"])

#                 menu_item_image = MenuItemImg(menu_item_id=menu_item_id, image_path=image_url)
#                 db.session.add(menu_item_image)
#                 db.session.commit()

#                 return jsonify({"image_url": image_url}), 201

#             elif image_url:
#                 menu_item_image = MenuItemImg(menu_item_id=menu_item_id, image_path=image_url)
#                 db.session.add(menu_item_image)
#                 db.session.commit()

#                 return jsonify({"image_url": image_url}), 201

#         return jsonify({"error": "Image or image URL is required."}), 400

#     except Exception as e:
#         print("Error:", e)
#         return jsonify({"error": "An error occurred while uploading the image."}), 500


# # *******************************Get Menu Item Image From AWS*******************************
# @menu_item_routes.route("/<int:menu_item_id>/image")
# def get_menu_item_image(menu_item_id):
#     menu_item = MenuItem.query.get(menu_item_id)

#     if menu_item and menu_item.image_url:
#         filename = menu_item.image_url.rsplit("/", 1)[-1]

#         return send_file(menu_item.image_url, as_attachment=True, attachment_filename=filename)

#     return "Image not found", 404
