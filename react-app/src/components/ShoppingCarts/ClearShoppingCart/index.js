import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkClearCart } from './../../../store/shoppingCarts';

const ClearShoppingCart = () => {
  const dispatch = useDispatch();

  const handleClearCart = () => {
    dispatch(thunkClearCart());
  };

  return (
    <button onClick={handleClearCart}>Clear Cart</button>
  );
};

export default ClearShoppingCart;
