from flask import Blueprint, jsonify, request, redirect, url_for, abort, current_app
import app
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, Review, Review, db, MenuItem, MenuItemImg, ShoppingCart, ShoppingCartItem
from sqlalchemy import func, distinct, or_, desc
from ..forms import ShoppingCartItemForm
import json
from ..helper_functions import normalize_data

# Define the blueprint for shopping cart routes
shopping_cart_routes = Blueprint('shopping_cart', __name__)

# ***************************************************************
# Endpoint to Fetch the Current User's Shopping Cart
# ***************************************************************
@login_required  # Ensure the user is logged in to access this endpoint
@shopping_cart_routes.route('/current')
def get_cart():
    """
    Fetches the current user's shopping cart, including all items within.

    Args:
        None

    Returns:
        Response: The shopping cart and its items for the current user.
                  Returns an error if the cart is not found or if there's any other issue.
    """
    try:
        # Query the database for the current user's shopping cart
        cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()
        if cart:
            total_price = cart.calculate_total_price()
        # If the cart is not found, return a structured response indicating there's no cart
        if not cart:
            return jsonify({
                "entities": {
                    "shoppingCartItems": {
                        "byId": {},
                        "allIds": []
                    }
                },
                "metadata": {
                    "totalItems": 0,
                    "totalPrice": 0.0
                }
            }), 404

        # Ensure that the current user is the owner of the retrieved cart
        if cart.user_id != current_user.id:
            raise PermissionError("You don't have permission to access this cart.", 403)

        # Convert the items in the cart to dictionaries and normalize the data for frontend consumption
        items = [item.to_dict() for item in cart.items]
        normalized_items = normalize_data(items, 'id')

        # Return the normalized items and a count of total items
        return jsonify({
            "entities": {
                "shoppingCartItems": normalized_items
            },
            "metadata": {
                "totalItems": len(normalized_items["allIds"]),
                "totalPrice": total_price
            }
        })

    # Handle various types of exceptions and log the errors
    except ValueError as ve:
        current_app.logger.error(f"ValueError in get_cart: {str(ve)}")
        message, code = ve.args if len(ve.args) == 2 else (str(ve), 400)
        return jsonify({"error": message}), code

    except PermissionError as pe:
        current_app.logger.error(f"Permission error in get_cart: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_cart: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while fetching the cart."}), 500

# ***************************************************************
# Endpoint to Add an Item to the Current User's Shopping Cart
# ***************************************************************
# @login_required
# @shopping_cart_routes.route('/<int:id>/items', methods=['POST'])
# def add_item_to_cart(id):
@login_required
@shopping_cart_routes.route('/items/add', methods=['POST'])
def add_item_to_cart():
    """
    Adds a new item to the current user's shopping cart based on the provided menu item ID.

    Args:
        id (int): The ID of the menu item to be added to the cart.

    Returns:
        Response: A message indicating the success or failure of the addition.
                  On success, also returns the details of the added item.
    """
    try:
        # Log the received data for debugging
        current_app.logger.info(f"Received data: {request.json}")

        # Initialize the shopping cart form with CSRF protection
        form = ShoppingCartItemForm()
        # form['csrf_token'].data = request.cookies['csrf_token']

        # If the form validates, attempt to add the item to the user's cart
        if form.validate_on_submit():

            # Ensure that the menu item ID is provided
            if not form.menu_item_id.data:
                return jsonify({"error": "menu_item_id is required"}), 400

            # Query the database for the user's cart, or create a new one if it doesn't exist
            cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()

            if not cart:
                cart = ShoppingCart(user_id=current_user.id)
                db.session.add(cart)

                db.session.commit()

            # Ensure the current user is the owner of the retrieved/created cart
            if cart.user_id != current_user.id:
                raise PermissionError("You don't have permission to modify this cart.", 403)

            # Create a new shopping cart item with the provided details and add it to the database
            cart_item = ShoppingCartItem(
                menu_item_id=form.menu_item_id.data,
                quantity=form.quantity.data,
                shopping_cart_id=cart.id
            )
            db.session.add(cart_item)
            db.session.commit()

            # Return a success message along with the details of the added item
            return jsonify({
                "message": "Item added to cart successfully",
                "entities": {
                    "shoppingCartItems": normalize_data([cart_item.to_dict()], 'id')
                }
            }), 201

        # If the form doesn't validate, return the form errors
        return jsonify(errors=form.errors), 400

    # Handle various types of exceptions and log the errors
    except PermissionError as pe:
        current_app.logger.error(f"PermissionError in add_item_to_cart: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    except Exception as e:
        current_app.logger.error(f"Unexpected error in add_item_to_cart: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while adding item to the cart."}), 500


# ***************************************************************
# Endpoint to Add Multiple Items to the Current User's Shopping Cart
# ***************************************************************
@login_required
@shopping_cart_routes.route('/items', methods=['POST'])
def add_items_to_cart():
    """
    Adds new items to the current user's shopping cart based on the provided menu item IDs and quantities.

    Returns:
        Response: A message indicating the success or failure of the addition.
                  On success, also returns the details of the added items.
    """
    try:
        # Parse the JSON payload
        data = request.get_json()
        if not isinstance(data, list):
            return jsonify({"error": "Expected a list of items"}), 400

        # Find or create a shopping cart for the current user
        cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()
        if not cart:
            cart = ShoppingCart(user_id=current_user.id)
            db.session.add(cart)

        # Process each item in the payload
        new_items = []
        for item_data in data:
            menu_item_id = item_data.get('menu_item_id')
            quantity = item_data.get('quantity')
            if not menu_item_id or not quantity:
                return jsonify({"error": "menu_item_id and quantity are required for each item"}), 400

            # Validate the menu item exists
            item = MenuItem.query.get(menu_item_id)
            if not item:
                return jsonify({"error": f"Invalid menu_item_id {menu_item_id}. This item does not exist."}), 400

            # Add the item to the cart
            cart_item = ShoppingCartItem(
                menu_item_id=menu_item_id,
                quantity=quantity,
                shopping_cart_id=cart.id
            )
            db.session.add(cart_item)
            new_items.append(cart_item)

        # Commit the new items to the database
        db.session.commit()

        # Return a success message with the details of the added items
        return jsonify({
            "message": "Items added to cart successfully",
            "entities": {
                "shoppingCartItems": normalize_data([item.to_dict() for item in new_items], 'id')
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error in add_items_to_cart: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while adding items to the cart."}), 500

# ***************************************************************
# Endpoint to Update a Specific Item in the Current User's Shopping Cart
# ***************************************************************

@login_required
@shopping_cart_routes.route('/items/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    """
    Updates the quantity or other details of a specific item in the current user's shopping cart.

    Args:
        item_id (int): The ID of the cart item to be updated.

    Returns:
        Response: A message indicating the success or failure of the update.
    """
    try:
        # Initialize the shopping cart form with CSRF protection
        form = ShoppingCartItemForm()
        # form['csrf_token'].data = request.cookies['csrf_token']

        # If the form validates, attempt to update the item details in the user's cart
        if form.validate_on_submit():
            # Fetch the cart item from the database using its ID
            cart_item = ShoppingCartItem.query.get(item_id)

            # Ensure that the current user is the owner of the cart item
            if not cart_item or cart_item.cart.user_id != current_user.id:
                raise PermissionError("You don't have permission to modify this cart item.", 403)

            # Update the quantity of the cart item
            cart_item.quantity = form.quantity.data
            db.session.commit()


            shopping_cart = ShoppingCart.query.get(cart_item.shopping_cart_id)
            db.session.refresh(shopping_cart)
            # Return a success message along with the updated item details
            return jsonify({
               "message": "Item updated successfully",
               "entities": {
                   "shoppingCartItems": normalize_data([cart_item.to_dict()], 'id')
               },
               "totalPrice": shopping_cart.calculate_total_price()
            }), 200

        # If the form doesn't validate, return the form errors
        return jsonify(errors=form.errors), 400

    # Handle various types of exceptions and log the errors
    except PermissionError as pe:
        current_app.logger.error(f"PermissionError in update_cart_item: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    except Exception as e:
        current_app.logger.error(f"Unexpected error in update_cart_item: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while updating the cart item."}), 500

# ***************************************************************
# Endpoint to Remove a Specific Item from the Current User's Shopping Cart
# ***************************************************************
@login_required
@shopping_cart_routes.route('/items/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    """
    Removes a specific item from the current user's shopping cart.

    Args:
        item_id (int): The ID of the cart item to be removed.

    Returns:
        Response: A message indicating the success or failure of the removal.
    """
    try:
        # Fetch the cart item from the database using its ID
        cart_item = ShoppingCartItem.query.get(item_id)

        # If the cart item is not found, return an error message
        if not cart_item:
            return jsonify({"error": "Cart item not found."}), 404

        # Check if the cart_item is associated with a cart
        if not cart_item.cart:
            return jsonify({"error": "Cart item is not associated with a valid cart."}), 400

        # Ensure that the current user is the owner of the cart item
        if cart_item.cart.user_id != current_user.id:
            raise PermissionError("You don't have permission to delete this cart item.", 403)

        # Remove the cart item from the database
        db.session.delete(cart_item)
        db.session.commit()

        # Return a success message indicating the item was removed
        return jsonify({
            "message": "Item removed from cart successfully",
            "entities": {
                "shoppingCartItems": {
                    "byId": {
                        cart_item.id: cart_item.to_dict()
                    },
                    "allIds": [cart_item.id]
                }
            }
        }), 200

    # Handle various types of exceptions and log the errors
    except PermissionError as pe:
        current_app.logger.error(f"PermissionError in delete_cart_item: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    except Exception as e:
        current_app.logger.error(f"Unexpected error in delete_cart_item: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while deleting the cart item."}), 500

# ***************************************************************
# Endpoint to Clear All Items from the Current User's Shopping Cart
# ***************************************************************
@login_required
@shopping_cart_routes.route('/current/clear', methods=['DELETE'])
def clear_cart():
    """
    Clears all items from the current user's shopping cart, effectively emptying it.

    Args:
        None

    Returns:
        Response: A message indicating the success or failure of the operation.
    """
    try:
        # Fetch the current user's shopping cart from the database
        cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()

        # If the cart is not found, raise a value error
        if not cart:
            raise ValueError("No cart found for the user.", 404)

        # Ensure that the current user is the owner of the cart
        if cart.user_id != current_user.id:
            raise PermissionError("You don't have permission to clear this cart.", 403)

        # Iterate through each item in the cart and delete it from the database
        for item in cart.items:
            db.session.delete(item)

        # Commit the changes to the database
        db.session.commit()

        # Return a success message indicating the cart was cleared
        return jsonify({
            "message": "Cart cleared successfully",
            "entities": {
                "shoppingCartItems": {
                    "byId": {},
                    "allIds": []
                }
            }
        }), 200

    # Handle value errors and log the error
    except ValueError as ve:
        current_app.logger.error(f"ValueError in clear_cart: {str(ve)}")
        message, code = ve.args if len(ve.args) == 2 else (str(ve), 400)
        return jsonify({"error": message}), code

    # Handle permission errors and log the error
    except PermissionError as pe:
        current_app.logger.error(f"PermissionError in clear_cart: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    # Handle any other exceptions and log the error
    except Exception as e:
        current_app.logger.error(f"Unexpected error in clear_cart: {str(e)}")
        # Rollback any changes to the database in case of errors
        db.session.rollback()
        return jsonify({"error": "An unexpected error occurred while clearing the cart."}), 500
