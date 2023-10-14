from flask import Blueprint, jsonify, request,redirect, url_for, abort, send_file
# import app
from flask import current_app as app
import traceback
from flask_login import current_user, login_user, logout_user, login_required
from sqlalchemy import func, distinct, or_, desc
from ..models import User, Review, Review, db, MenuItem, MenuItemImg
from ..s3 import get_unique_filename, upload_file_to_s3, remove_file_from_s3, ALLOWED_EXTENSIONS, upload_file, allowed_file
from ..forms import MenuItemForm, MenuItemImgForm
import json
# from ..helper_functions.image_handlers import
from ..helper_functions import upload_image, delete_image

menu_item_routes = Blueprint('menu_items', __name__)

# *******************************Edit a Menu Item*******************************
@menu_item_routes.route('/<int:id>', methods=["PUT"])
@login_required
def update_menu_item(id):
    try:
        menu_item_to_update = MenuItem.query.get(id)
        if menu_item_to_update is None:
            return jsonify({"error": "Menu Item not found."}), 404

        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        restaurant = menu_item_to_update.restaurant
        if restaurant.owner_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        form = MenuItemForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        data = request.get_json()

        for field, value in data.items():
            if hasattr(form, field):
                setattr(form, field, value)

        if form.validate_on_submit():
            for field in form:
                setattr(menu_item_to_update, field.name, field.data)

            db.session.commit()
            return jsonify(message="Menu Item updated successfully"), 200
        else:
            return jsonify(errors=form.errors), 400

    except Exception as e:
        print(e)
        print("Error Editing Menu Item:", traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the review."}), 500

# *******************************Delete a Menu Item*******************************
@menu_item_routes.route('/<int:id>', methods=["DELETE"])
def delete_menu_item(id):
    try:
        menu_item_to_delete = MenuItem.query.get(id)

        if menu_item_to_delete is None:
            return jsonify({"error": "Menu Item not found."}), 404

        restaurant = menu_item_to_delete.restaurant
        if restaurant.owner_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        db.session.delete(menu_item_to_delete)
        db.session.commit()

        return jsonify(message="Menu Item deleted successfully"), 200

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": "An error occurred while deleting the menu item."}), 500

# *******************************Upload Menu Item Image to AWS*******************************
@menu_item_routes.route("/<int:menu_item_id>/images", methods=["POST"])
@login_required
def upload_menu_item_image(menu_item_id):
    try:
        form = MenuItemImgForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        print("Form data:", form.data)
        print("Form errors:", form.errors)

        if form.validate_on_submit():
            return upload_image(form.image.data, form.image_url.data, MenuItemImg, menu_item_id, db)
        else:
            return jsonify({"errors": form.errors}), 400
    except Exception as e:
        print("Error uploading image:", traceback.format_exc())
        return jsonify({"error": "An error occurred while uploading the image."}), 500

# *******************************Get Menu Item Image From AWS*******************************
@menu_item_routes.route("/<int:menu_item_id>/image")
def get_menu_item_image(menu_item_id):
    menu_item = MenuItem.query.get(menu_item_id)

    if menu_item and menu_item.image_url:
        filename = menu_item.image_url.rsplit("/", 1)[-1]

        return send_file(menu_item.image_url, as_attachment=True, attachment_filename=filename)

    return "Image not found", 404
