// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useModal } from "../../../context/Modal";
// import { thunkDeleteRestaurant } from "../../../store/restaurants";
// import MessageComponent from "../../Modals/ModalMessage";
// import "./DeleteRestaurant.css";

// export default function DeleteRestaurant({ restaurantId }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { setModalContent } = useModal();

//   const handleDelete = async (e) => {
//     e.stopPropagation();
//     try {
//       await dispatch(thunkDeleteRestaurant(restaurantId));
//       setModalContent(<div>Restaurant deleted successfully!</div>);
//       navigate("/owner/restaurants");
//       //   navigate('/');
//     } catch (err) {
//       console.error("Failed to delete the restaurant:", err);
//     }
//   };

//   return (
//     <>
//       <button className="delete-rest-btn" onClick={handleDelete}>
//         Delete Restaurant
//       </button>
//     </>
//   );
// }

// DeleteRestaurant.js
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../context/Modal";
import { thunkDeleteRestaurant } from "../../../store/restaurants";
import ModalMessage from "../../Modals/ModalMessage";
import "./DeleteRestaurant.css";

export default function DeleteRestaurant({ restaurantId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setModalContent } = useModal();

  // A function to close the modal and then navigate
  const closeModalAndNavigate = (navigateTo) => {
    setModalContent(null);
    setTimeout(() => navigate(navigateTo), 500);
  };

  // in DeleteRestaurant.js
  const handleDelete = async () => {
    try {
      await dispatch(thunkDeleteRestaurant(restaurantId));
      setModalContent(
        <ModalMessage
          type="success"
          message="Restaurant deleted successfully!"
          onClose={() => setModalContent(null)}
          duration={3000}
        />
      );
      setTimeout(() => {
        setModalContent(null);
        navigate("/owner/restaurants");
      }, 3000);
      // setTimeout(() => closeModalAndNavigate("/owner/restaurants"), 3000);
    } catch (err) {
      console.error("Failed to delete the restaurant:", err);
      setModalContent(
        <ModalMessage
          type="error"
          message="Failed to delete restaurant. Please try again."
          onClose={() => closeModalAndNavigate("/owner/restaurants")}
        />
      );
      setTimeout(() => closeModalAndNavigate("/owner/restaurants"), 3000);
    }
  };

  return (
    <button className="delete-rest-btn" onClick={handleDelete}>
      Delete Restaurant
    </button>
  );
}
