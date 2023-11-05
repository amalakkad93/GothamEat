// Button to cancel an order
import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkCancelOrder } from '../../../store/orders';

const CancelOredrButton = ({ orderId }) => {
  const dispatch = useDispatch();

  const handleCancel = () => {
    dispatch(thunkCancelOrder(orderId));
  };

  return <button onClick={handleCancel}>Cancel Order</button>;
};

export default CancelOredrButton;
