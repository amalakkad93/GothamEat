from flask import (Blueprint, jsonify, request, redirect, url_for, abort,
                   send_file, current_app)
import traceback
from icecream import ic
from flask_login import current_user, login_required
from sqlalchemy import func, distinct, or_, desc
from ..models import User, Review, Review, db, MenuItem, MenuItemImg
from ..s3 import (get_unique_filename, upload_file_to_s3, remove_file_from_s3,
                  ALLOWED_EXTENSIONS, upload_file, allowed_file)
from ..forms import MenuItemForm, MenuItemImgForm
# from ..helper_functions import upload_image, delete_image
from .. import helper_functions as hf

# Blueprint for routes related to Menu Items
menu_item_routes = Blueprint('menu_items', __name__)

# ***************************************************************
# Endpoint to Get Details of a Menu Item by Id
# ***************************************************************
@menu_item_routes.route('/<int:id>', methods=["GET"])
def get_menu_item(id):
    """
    Retrieve the details of a specific menu item.

    Args:
        item_id (int): The ID of the menu item to fetch.

    Returns:
        Response: The menu item details or an error message in JSON format.
    """
    try:
        menu_item = MenuItem.query.get(id)

        if not menu_item:
            return jsonify({"error": "Menu Item not found."}), 404

        # Fetching related images
        menu_item_images = MenuItemImg.query.filter_by(menu_item_id=id).all()
        image_paths = [img.image_path for img in menu_item_images]

        # Convert the menu item to a dictionary
        data_item = {
            'id': menu_item.id,
            'name': menu_item.name,
            'description': menu_item.description,
            'type': menu_item.type,
            'price': menu_item.price,
            'image_paths': image_paths,
        }

        # Wrap the data item in a list for normalization
        data_list = [data_item]

        # Normalize the data
        normalized_data = hf.normalize_data(data_list, 'id')

        return jsonify(normalized_data), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching menu item with ID {id}: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while fetching the menu item."}), 500

# ***************************************************************
# Endpoint to Get Filtered Menu Items
# ***************************************************************
@menu_item_routes.route('/list', methods=["GET"])
def get_filtered_menu_items():
    try:
        # Fetch query parameters for filtering
        category = request.args.get('type', default=None, type=str)
        min_price = request.args.get('min_price', default=0, type=float)
        max_price = request.args.get('max_price', default=float('inf'), type=float)
        restaurant_id = request.args.get('restaurant_id', type=int)

        ic("Category:", category, "Min price:", min_price, "Max price:", max_price, "Restaurant ID:", restaurant_id)

        # Build the query with optional filters
        query = MenuItem.query.filter(MenuItem.restaurant_id == restaurant_id)
        ic("Query:", query)
        # Execute the query
        menu_items = query.all()
        ic("Fetched menu items:", menu_items)

        if category and category.lower() != 'all':
            query = query.filter(MenuItem.type == category)

        query = query.filter(MenuItem.price >= min_price, MenuItem.price <= max_price)

        # Serialize the menu items
        menu_items_data = [item.to_dict() for item in menu_items]
        for item_data in menu_items_data:
            item_data['image_paths'] = [img.image_path for img in MenuItemImg.query.filter_by(menu_item_id=item_data['id']).all()]

        return jsonify(menu_items_data), 200
    except Exception as e:
        print(f"Error fetching menu items: {e}")
        return jsonify({"error": "An unexpected error occurred while fetching the menu items."}), 500

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
    Stores the image URL for a specified menu item.
    """
    try:
        # Get data from the incoming request
        data = request.get_json()
        image_url = data.get("image_url")

        # Check if image_url is present in the payload
        if not image_url:
            return jsonify({"error": "Image URL is required."}), 400

        # First, delete all existing images associated with this menu item
        existing_images = MenuItemImg.query.filter_by(menu_item_id=menu_item_id).all()
        for img in existing_images:
            db.session.delete(img)

        # Create a new MenuItemImg instance and store the image URL
        new_image = MenuItemImg(menu_item_id=menu_item_id, image_path=image_url)
        db.session.add(new_image)
        db.session.commit()

        print("Sending image data:", {"status": "success", "image_url": image_url, "id": new_image.id})
        # Return the ID of the new image along with the other data
        return jsonify({
            "status": "success",
            "image_url": image_url,
            "id": new_image.id,  
            "code": 201
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error in upload_menu_item_image: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while storing the image URL."}), 500


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
