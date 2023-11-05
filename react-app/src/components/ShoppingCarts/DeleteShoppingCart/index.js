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
import React from "react";
import { useDispatch, useSelector } from "react-redux";
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
  };

  // If the item is not in the state, we can't delete it
  if (!item) return <p>Item not found in the cart.</p>;

  // Render the shopping cart item and its associated delete button
  return (
    <div className="cart-item">
      <span>
      {itemName} (Quantity: {item.quantity})
      </span>
      <button onClick={handleDeleteItem}>Delete</button>
    </div>
  );
};

export default DeleteShoppingCart;
