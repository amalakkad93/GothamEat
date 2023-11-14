import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { thunkClearCart } from './../../../store/shoppingCarts';
import ClearCartModal from './ClearCartModal';

const ClearShoppingCart = ({ handleAddItems }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const handleClearCart = () => {
    dispatch(thunkClearCart());
    setModalVisible(false); // Close modal after clearing
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <div className="dot-menu-container">
      <button onClick={openModal} className="button-dots">...</button>
      <ClearCartModal onClearCart={handleClearCart} onAddItems={handleAddItems} modalVisible={modalVisible} />
    </div>
    </>
  );
};

export default ClearShoppingCart;
