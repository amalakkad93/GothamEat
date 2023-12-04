import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { FaRedo } from 'react-icons/fa';
import { thunkReorderPastOrder, thunkGetUserLastOrder } from "../../../store/orders";

import "./ReorderComponent.css";

const ReorderComponent = ({ orderId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => ({
    isLoading: state.orders.isLoading,
    // error: state.orders.error
  }));

  const userId = useSelector(state => state.session?.user?.id);

  const handleReorder = async () => {
    try {
      if (orderId) {
        const newOrderId = await dispatch(thunkReorderPastOrder(orderId));
        if (newOrderId) {
          navigate(`/orders/${newOrderId}`);
        } else {
          console.error("Error: New order ID not received.");
        }
      }
    } catch (error) {
      console.error("Error during reorder:", error);
    }
  };


  return (
    <div className="reorder-container">
      {isLoading && <p>Loading...</p>}
      <button onClick={handleReorder} disabled={isLoading} className="reorder-button">
        <FaRedo className="icon" /> 
        Reorder Order #{orderId}
      </button>
      {/* {error && <p className="error-message">Error: {error}</p>} */}
    </div>
  );
};

export default ReorderComponent;
