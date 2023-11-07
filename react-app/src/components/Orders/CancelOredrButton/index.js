import React from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkCancelOrder } from '../../../store/orders';
import { thunkClearCart } from '../../../store/shoppingCarts';

const CancelOrderButton = ({ orderId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(thunkCancelOrder(orderId)); // Cancel the order
        await dispatch(thunkClearCart()); // Clear the cart
        toast.success('Order has been cancelled.'); // Show success message
        navigate('/orders'); // Navigate back to orders page
      } catch (error) {
        toast.error('Failed to cancel order: ' + (error.message || error)); // Show error message
      }
    }
  };

  return <button onClick={handleCancel}>Cancel Order</button>;
};

export default CancelOrderButton;
