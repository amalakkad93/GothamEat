/**
 * DeleteShoppingCart Component
 *
 * This component allows users to view an item within their shopping cart and provides an interface
 * to delete that item from the cart. Each item displays its name and quantity.
 * A delete button is provided to remove the item from the cart.
 *
 * @param {Object} item - The shopping cart item object.
 * @param {string} itemName - The name of the menu item in the shopping cart.
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkDeleteItemFromCart } from "../../../store/shoppingCarts";

const DeleteShoppingCart = ({ item, itemName }) => {
    // Hook to allow component to dispatch actions to the Redux store
    const dispatch = useDispatch();

    /**
     * handleDeleteItem
     *
     * This function dispatches an action to delete the item from the shopping cart.
     */
    const handleDeleteItem = () => {
        dispatch(thunkDeleteItemFromCart(item.id));
    }

    // Render the shopping cart item and its associated delete button
    return (
        <li className="cart-item">
            {/* Display the item name and its quantity */}
            <span>
                {itemName} (Quantity: {item.quantity})
            </span>
            {/* Button to trigger the deletion of the item from the cart */}
            <button onClick={handleDeleteItem}>Delete</button>
        </li>
    );
}

export default DeleteShoppingCart;
