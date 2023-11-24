import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkClearCart } from "./../../../store/shoppingCarts";
import ClearCartModal from "./ClearCartModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";

import "./ClearShoppingCart.css";

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

  const toggleModal = () => {
    setModalVisible((prev) => !prev);
  };

  return (
    <>
      <div className="dot-menu-container">
        <button onClick={toggleModal} className="button-dots">
          <FontAwesomeIcon icon={faEllipsisH} />{" "}
          {/* Horizontal ellipsis icon */}
        </button>
        <ClearCartModal
          onClearCart={handleClearCart}
          onAddItems={handleAddItems}
          modalVisible={modalVisible}
        />
      </div>
    </>
  );
};

export default ClearShoppingCart;
