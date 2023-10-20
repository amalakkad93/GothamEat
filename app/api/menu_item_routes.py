from flask import (Blueprint, jsonify, request, redirect, url_for, abort,
                   send_file, current_app as app)
import traceback
from flask_login import current_user, login_required
from sqlalchemy import func, distinct, or_, desc
from ..models import User, Review, Review, db, MenuItem, MenuItemImg
from ..s3 import (get_unique_filename, upload_file_to_s3, remove_file_from_s3,
                  ALLOWED_EXTENSIONS, upload_file, allowed_file)
from ..forms import MenuItemForm, MenuItemImgForm
from ..helper_functions import upload_image, delete_image

# Blueprint for routes related to Menu Items
menu_item_routes = Blueprint('menu_items', __name__)

# ***************************************************************
# Endpoint to Edit a Menu Item
# ***************************************************************
@menu_item_routes.route('/<int:id>', methods=["PUT"])
@login_required
def update_menu_item(id):
    """
    Update a specific menu item.

    Args:
        id (int): The ID of the menu item to be updated.

    Returns:
        Response: A success or error message in JSON format.
    """
    try:
        # Fetch the menu item to update
        menu_item_to_update = MenuItem.query.get(id)
        if not menu_item_to_update:
            return jsonify({"error": "Menu Item not found."}), 404

        if not current_user.is_authenticated:
            return jsonify(message="You need to be logged in"), 401

        # Ensure the current user owns the restaurant associated with the menu item
        restaurant = menu_item_to_update.restaurant
        if restaurant.owner_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        form = MenuItemForm()
        form['csrf_token'].data = request.cookies['csrf_token']
        data = request.get_json()

        # Map the incoming form data to the existing menu item fields
        for field, value in data.items():
            if hasattr(form, field):
                setattr(form, field, value)

        if form.validate_on_submit():
            # Update the menu item fields based on the validated form fields
            for field in form:
                setattr(menu_item_to_update, field.name, field.data)

            db.session.commit()
            return jsonify(message="Menu Item updated successfully"), 200
        else:
            return jsonify(errors=form.errors), 400

    except Exception as e:
        # Log the error for debugging purposes
        print("Error Editing Menu Item:", traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the review."}), 500

# ***************************************************************
# Endpoint to Delete a Menu Item
# ***************************************************************
@menu_item_routes.route('/<int:id>', methods=["DELETE"])
def delete_menu_item(id):
    """
    Delete a specific menu item.

    Args:
        id (int): The ID of the menu item to be deleted.

    Returns:
        Response: A success or error message in JSON format.
    """
    try:
        # Fetch the menu item to delete
        menu_item_to_delete = MenuItem.query.get(id)

        if not menu_item_to_delete:
            return jsonify({"error": "Menu Item not found."}), 404

        # Ensure the current user owns the restaurant associated with the menu item
        restaurant = menu_item_to_delete.restaurant
        if restaurant.owner_id != current_user.id:
            return jsonify(message="Unauthorized"), 403

        db.session.delete(menu_item_to_delete)
        db.session.commit()

        return jsonify(message="Menu Item deleted successfully"), 200

    except Exception as e:
        # Log the error for debugging purposes
        print(e)
        db.session.rollback()
        return jsonify({"error": "An error occurred while deleting the menu item."}), 500

# ***************************************************************
# Endpoint to Upload Menu Item Images
# ***************************************************************
@menu_item_routes.route("/<int:menu_item_id>/images", methods=["POST"])
@login_required
def upload_menu_item_image(menu_item_id):
    """
    Upload a new image for a specific menu item.

    Args:
        menu_item_id (int): The ID of the menu item for which the image is being uploaded.

    Returns:
        Response: A success or error message in JSON format.
    """
    try:
        form = MenuItemImgForm()
        form['csrf_token'].data = request.cookies['csrf_token']

        if form.validate_on_submit():
            # Use helper function to handle the image upload process
            return upload_image(form.image.data, form.image_url.data, MenuItemImg, menu_item_id, db)
        else:
            return jsonify({"errors": form.errors}), 400
    except Exception as e:
        # Log the error for debugging purposes
        print("Error uploading image:", traceback.format_exc())
        return jsonify({"error": "An error occurred while uploading the image."}), 500

# ***************************************************************
# Endpoint to Get Menu Item Image
# ***************************************************************
@menu_item_routes.route("/<int:menu_item_id>/image")
def get_menu_item_image(menu_item_id):
    """
    Retrieve a specific menu item's image.

    Args:
        menu_item_id (int): The ID of the menu item whose image is being retrieved.

    Returns:
        Response: The image or an error message.
    """
    # Fetch the specified menu item
    menu_item = MenuItem.query.get(menu_item_id)

    if menu_item and menu_item.image_url:
        # If the menu item has an associated image, return it
        filename = menu_item.image_url.rsplit("/", 1)[-1]
        return send_file(menu_item.image_url, as_attachment=True, attachment_filename=filename)

    return "Image not found", 404
