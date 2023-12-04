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
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkDeleteItemFromCart } from "../../../store/shoppingCarts";
import { FaTrashAlt } from "react-icons/fa";
import "./DeleteShoppingCart.css";

const DeleteShoppingCart = ({ item, onItemDeleted }) => {
  // Hook to allow component to dispatch actions to the Redux store
  const dispatch = useDispatch();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check if item and item.id are valid
  if (!item || typeof item.id === "undefined") {
    console.error("Invalid item or item ID:", item);
    return <p>Item not found in the cart.</p>;
  }

  /**
   * handleDeleteItem
   *
   * This function dispatches an action to delete the item from the shopping cart.
   */

  const handleDeleteItem = () => {
    dispatch(thunkDeleteItemFromCart(item.id));
    setShowSuccessMessage(true);
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };


  // Render the shopping cart item and its associated delete button
  return (
    <div className="cart-item">
      <button className="delete-button"  onClick={() => setShowConfirmModal(true)} aria-label={`Delete ${item.name}`}>
        <FaTrashAlt />
      </button>
      {showConfirmModal && (
        <div className="confirm-modal">
          <p>Are you sure you want to delete {item.name}?</p>
          <button className="yes-button" onClick={handleDeleteItem}>Yes</button>
          <button className="no-button" onClick={handleCancel}>No</button>
        </div>
      )}
    </div>
  );
};

export default DeleteShoppingCart;
