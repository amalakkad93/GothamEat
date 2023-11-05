// Form to update an order's status
import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkUpdateOrderStatus } from '../../../store/orders';

const OrderStatusUpdater = ({ orderId, currentStatus }) => {
  const dispatch = useDispatch();

  const handleStatusChange = (newStatus) => {
    dispatch(thunkUpdateOrderStatus(orderId, newStatus));
  };

  return (
    <select value={currentStatus} onChange={(e) => handleStatusChange(e.target.value)}>
      {/* Populate with possible statuses */}
    </select>
  );
};

export default OrderStatusUpdater;
