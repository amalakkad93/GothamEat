from flask import Blueprint, jsonify, request,redirect, url_for, abort, current_app
import app
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, Review, Review, db, MenuItem,MenuItemImg, ShoppingCart, ShoppingCartItem
from sqlalchemy import func, distinct, or_, desc
from ..forms import ShoppingCartItemForm

import json
from ..helper_functions import normalize_data

shopping_cart_routes = Blueprint('shopping_cart', __name__)

# *******************************Get a User's Shopping Cart*******************************
@login_required
@shopping_cart_routes.route('/current')
def get_cart():
    try:
        cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()

        if not cart:
            return jsonify({
                "entities": {
                    "shoppingCartItems": {
                        "byId": {},
                        "allIds": []
                    }
                },
                "metadata": {
                    "totalItems": 0
                }
            }), 404

        if cart.user_id != current_user.id:
            raise PermissionError("You don't have permission to access this cart.", 403)

        items = [item.to_dict() for item in cart.items]
        normalized_items = normalize_data(items, 'id')

        return jsonify({
            "entities": {
                "shoppingCartItems": normalized_items
            },
            "metadata": {
                "totalItems": len(normalized_items["allIds"])
            }
        })

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

# *******************************Add an Item to a User's Shopping Cart*******************************
@login_required
@shopping_cart_routes.route('/<int:id>/items', methods=['POST'])
def add_item_to_cart(id):
    try:
        form = ShoppingCartItemForm()
        form['csrf_token'].data = request.cookies['csrf_token']

        if form.validate_on_submit():

            if not form.menu_item_id.data:
                return jsonify({"error": "menu_item_id is required"}), 400

            cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()
            if not cart:
                cart = ShoppingCart(user_id=current_user.id)
                db.session.add(cart)

            if cart.user_id != current_user.id:
                raise PermissionError("You don't have permission to modify this cart.", 403)

            cart_item = ShoppingCartItem(
                menu_item_id=form.menu_item_id.data,
                quantity=form.quantity.data,
                shopping_cart_id=cart.id
            )
            db.session.add(cart_item)
            db.session.commit()

            return jsonify({
                "message": "Item added to cart successfully",
                "entities": {
                    "shoppingCartItems": normalize_data([cart_item.to_dict()], 'id')
                }
            }), 201

        return jsonify(errors=form.errors), 400

    except PermissionError as pe:
        current_app.logger.error(f"PermissionError in add_item_to_cart: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    except Exception as e:
        current_app.logger.error(f"Unexpected error in add_item_to_cart: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while adding item to the cart."}), 500


# *******************************Update an Item in a User's Shopping Cart*******************************
@login_required
@shopping_cart_routes.route('/items/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    try:
        form = ShoppingCartItemForm()
        form['csrf_token'].data = request.cookies['csrf_token']

        if form.validate_on_submit():
            cart_item = ShoppingCartItem.query.get(item_id)

            if not cart_item or cart_item.cart.user_id != current_user.id:
                raise PermissionError("You don't have permission to modify this cart item.", 403)

            cart_item.quantity = form.quantity.data
            db.session.commit()

            return jsonify({
                "message": "Item updated successfully",
                "entities": {
                    "shoppingCartItems": normalize_data([cart_item.to_dict()], 'id')
                }
            }), 200

        return jsonify(errors=form.errors), 400

    except PermissionError as pe:
        current_app.logger.error(f"PermissionError in update_cart_item: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    except Exception as e:
        current_app.logger.error(f"Unexpected error in update_cart_item: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while updating the cart item."}), 500

# *******************************Delete an Item from a User's Shopping Cart*******************************
@login_required
@shopping_cart_routes.route('/items/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    try:
        cart_item = ShoppingCartItem.query.get(item_id)

        if not cart_item:
            return jsonify({"error": "Cart item not found."}), 404

        if cart_item.cart.user_id != current_user.id:
            raise PermissionError("You don't have permission to delete this cart item.", 403)

        db.session.delete(cart_item)
        db.session.commit()

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

    except PermissionError as pe:
        current_app.logger.error(f"PermissionError in delete_cart_item: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    except Exception as e:
        current_app.logger.error(f"Unexpected error in delete_cart_item: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while deleting the cart item."}), 500

# *******************************Clear a User's Shopping Cart*******************************
@login_required
@shopping_cart_routes.route('/current/clear', methods=['DELETE'])
def clear_cart():
    try:
        cart = ShoppingCart.query.filter_by(user_id=current_user.id).first()

        if not cart:
            raise ValueError("No cart found for the user.", 404)

        if cart.user_id != current_user.id:
            raise PermissionError("You don't have permission to clear this cart.", 403)

        for item in cart.items:
            db.session.delete(item)

        db.session.commit()

        return jsonify({
            "message": "Cart cleared successfully",
            "entities": {
                "shoppingCartItems": {
                    "byId": {},
                    "allIds": []
                }
            }
        }), 200

    except ValueError as ve:
        current_app.logger.error(f"ValueError in clear_cart: {str(ve)}")
        message, code = ve.args if len(ve.args) == 2 else (str(ve), 400)
        return jsonify({"error": message}), code

    except PermissionError as pe:
        current_app.logger.error(f"PermissionError in clear_cart: {str(pe)}")
        message, code = pe.args if len(pe.args) == 2 else (str(pe), 403)
        return jsonify({"error": message}), code

    except Exception as e:
        current_app.logger.error(f"Unexpected error in clear_cart: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "An unexpected error occurred while clearing the cart."}), 500
