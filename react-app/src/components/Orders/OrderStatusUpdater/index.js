import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkUpdateOrderStatus } from '../../../store/orders';

const OrderStatusUpdater = ({ orderId, currentStatus }) => {
  const dispatch = useDispatch();

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(thunkUpdateOrderStatus(orderId, newStatus));
      alert('Order status updated to ' + newStatus);
    } catch (error) {
      alert('Failed to update order status: ' + (error.message || error));
    }
  };

  return (
    <select value={currentStatus} onChange={(e) => handleStatusChange(e.target.value)}>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
};

export default OrderStatusUpdater;

