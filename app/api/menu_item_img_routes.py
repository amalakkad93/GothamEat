from flask import Blueprint, jsonify, request,redirect, url_for, abort
import app
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, Review, db, MenuItem, MenuItemImg
from sqlalchemy import func, distinct, or_, desc
from ..forms import MenuItemImgForm
import json
from ..helper_functions import review_image_exists, associated_review_exists, review_belongs_to_user, remove_image_from_s3, upload_image, delete_image

menu_item_img_routes = Blueprint('menu_item_img', __name__)

# *******************************Delete a Menu Item Image*******************************
@menu_item_img_routes.route('/<int:id>', methods=["DELETE"])
@login_required
def delete_menu_item_image(id):
     # Callback to check if the current user has permission to delete the image
    def has_permission(owner):
        return owner.id == current_user.id

    # Callback to get the owner ID of the image
    def get_owner(image_record):
        return image_record.menu_item.restaurant.owner

    result = delete_image(id, MenuItemImg, db, 'Menu item image', has_permission, get_owner)
    if result['status'] == "success":
        return jsonify(message=result["message"]), result["code"]
    else:
        return jsonify({"error": result["message"]}), result["code"]

