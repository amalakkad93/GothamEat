from flask import Blueprint, jsonify, request, redirect, url_for, abort
import app
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, Review, db, MenuItem, MenuItemImg
from sqlalchemy import func, distinct, or_, desc
from ..forms import MenuItemImgForm
import json
from ..helper_functions import (review_image_exists, associated_review_exists,
                                review_belongs_to_user, remove_image_from_s3,
                                upload_image, delete_image)

# Blueprint for routes related to Menu Item Images
menu_item_img_routes = Blueprint('menu_item_img', __name__)

@menu_item_img_routes.route('/<int:id>', methods=["DELETE"])
@login_required
def delete_menu_item_image(id):
    """
    Delete a specific menu item image.

    This route allows authorized users (i.e., restaurant owners) to delete
    images associated with menu items. The image ID is passed in the URL.

    Args:
        id (int): The ID of the menu item image to be deleted.

    Returns:
        Response: A success or error message in JSON format.
    """
    # Callback to check if the current user (restaurant owner)
    # has permission to delete the specified image.
    def has_permission(owner):
        return owner.id == current_user.id

    # Callback to fetch the owner (restaurant owner) of the specified image.
    def get_owner(image_record):
        return image_record.menu_item.restaurant.owner

    # Attempt to delete the image using the helper function.
    # This function handles the logic of checking permissions,
    # fetching the owner, and performing the actual deletion.
    result = delete_image(id, MenuItemImg, db, 'Menu item image', has_permission, get_owner)

    # Return the appropriate response based on the deletion outcome.
    if result['status'] == "success":
        return jsonify(message=result["message"]), result["code"]
    else:
        return jsonify({"error": result["message"]}), result["code"]

