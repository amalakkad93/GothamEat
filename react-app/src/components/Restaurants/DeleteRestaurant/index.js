import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkDeleteRestaurant } from '../../../store/restaurants';
import './DeleteRestaurant.css';

export default function DeleteRestaurant({ restaurantId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
      try {
          await dispatch(thunkDeleteRestaurant(restaurantId));
          alert("Restaurant deleted successfully!");
          navigate('/owner/restaurants');
        //   navigate('/');
      } catch (err) {
          console.error("Failed to delete the restaurant:", err);
      }
  };

  return (
      <button className= "delete-rest-btn" onClick={handleDelete}>
          Delete Restaurant
      </button>
  );
};
