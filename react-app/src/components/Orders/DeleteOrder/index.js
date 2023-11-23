import React, { useState } from "react";
import { toast } from "react-toastify";
import { useModal } from "../../../context/Modal";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkDeleteOrder, thunkGetUserOrders } from "../../../store/orders";

import "../CancelOrderButton/CancleOrderButton.css";

const DeleteOrder = ({ orderId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { closeModal } = useModal();
  const userId = useSelector((state) => state.session.user.id);

  const handleDelete = async () => {
    try {
      await dispatch(thunkDeleteOrder(orderId, userId));
      // await dispatch(thunkGetUserOrders(userId));

      // navigate('/orders');
      closeModal();
    } catch (error) {
      toast.error("Failed to cancel order: " + (error.message || error)); 
    }
  };

  return (
    <>
      <div className="tile-parent-cancel-order">
        <div className="cancel-order-h1-p-tag">
          <h1 className="cancel-order-h1-tag">Confirm Deletetion</h1>
          <p className="cancel-order-p-tag">
            Are you sure you want to delete this order?
          </p>
        </div>
        <div className="cancel-keep-order-cancel-btn">
          <button onClick={handleDelete}>Yes, Delete Order</button>
          <button id="cancel-order-btn" onClick={closeModal}>
            No (Keep Order)
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteOrder;
