import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkCreateOrderFromCart } from '../../../store/orders';

const OrderCreationForm = () => {
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(thunkCreateOrderFromCart());
    // Additional logic after order creation
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Create Order</button>
    </form>
  );
};

export default OrderCreationForm;
