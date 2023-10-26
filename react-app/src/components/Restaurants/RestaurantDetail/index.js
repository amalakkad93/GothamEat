import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkGetRestaurantDetails } from "../../../store/restaurants";
import "./RestaurantDetail.css"; // Import your CSS for styling

export default function RestaurantDetail() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const restaurantData = useSelector((state) => state.restaurants.singleRestaurant);

  // Extract relevant data from the nested structure
  const restaurant = restaurantData.entities?.restaurants[restaurantId];
  const menuItems = restaurantData.entities?.menuItems || {};
  const owner = restaurantData.entities?.owner || {};

  useEffect(() => {
    dispatch(thunkGetRestaurantDetails(restaurantId));
  }, [dispatch, restaurantId]);

  // Conditionally render the "Loading..." message until the data is available
  if (!restaurant) {
    return <p>Loading...</p>;
  }

  // Display restaurant details
  return (
    <div className="restaurant-detail-container">
      <div
        className="restaurant-banner"
        style={{ backgroundImage: `url(${restaurant.banner_image_path})` }}
      >
        <h1 className="restaurant-name">{restaurant.name}</h1>
      </div>
      <div className="restaurant-info">
        <h2>Restaurant Details</h2>
        <p>{restaurant.description}</p>
        <p>
          Address: {restaurant.street_address}, {restaurant.city},{" "}
          {restaurant.state}, {restaurant.country}
        </p>
        <p>Opening Time: {restaurant.opening_time}</p>
        <p>Closing Time: {restaurant.closing_time}</p>
        <p>Rating: {restaurant.average_rating}</p>
      </div>
      {/* Display menu items */}
      <div className="menu-items">
        <h2>Menu Items</h2>
        <ul>
          {Object.values(menuItems).map((menuItem) => (
            <li key={menuItem.id} className="menu-item">
              <p className="menu-item-name">{menuItem.name}</p>
              <p className="menu-item-description">{menuItem.description}</p>
              <p className="menu-item-price">${menuItem.price.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>
      {/* Display owner details */}
      <div className="owner-info">
        <h2>Owner</h2>
        <p>Name: {owner.first_name} {owner.last_name}</p>
        <p>Email: {owner.email}</p>
      </div>
    </div>
  );
}

