import React, { useState } from "react";
import { toast } from "react-toastify";
import { useModal } from "../../../context/Modal";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkCancelOrder } from "../../../store/orders";
import { thunkClearCart } from "../../../store/shoppingCarts";
import "./CancleOrderButton.css";

const CancelOrderButton = ({ orderId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { closeModal } = useModal();

  const handleCancel = async () => {
    try {
      await dispatch(thunkCancelOrder(orderId)); // Cancel the order
      await dispatch(thunkClearCart()); // Clear the cart
      toast.success("Order has been cancelled."); // Show success message
      // navigate('/orders');
      closeModal();
    } catch (error) {
      toast.error("Failed to cancel order: " + (error.message || error)); // Show error message
    }
  };

  return (
    <>
      <div className="tile-parent-cancel-order">
        <div className="cancel-order-h1-p-tag">
          <h1 className="cancel-order-h1-tag">Confirm Cancelation</h1>
          <p className="cancel-order-p-tag">
            Are you sure you want to cancel this order?
          </p>
        </div>
        <div className="cancel-keep-order-cancel-btn">
          <button onClick={handleCancel}>Yes, Cancel Order</button>
          <button id="cancel-order-btn" onClick={closeModal}>
            No (Keep Order)
          </button>
        </div>
      </div>
    </>
  );
};

export default CancelOrderButton;
