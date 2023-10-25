import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {useFavorites} from "../../../context/FavoritesContext";
import {
  thunkAddFavorite,
  thunkRemoveFavorite,
} from "../../../store/favorites";
import { thunkGetNearbyRestaurants } from "../../../store/restaurants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-solid-svg-icons";

import "./GetNearbyRestaurants.css";

// The NearbyRestaurants component is responsible for displaying a list of nearby restaurants.
// It utilizes Redux to manage state and perform actions such as adding/removing favorites and fetching restaurant data.

export default function NearbyRestaurants() {
  const dispatch = useDispatch();
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Extracting necessary data from the Redux state
  const favoritesById = useSelector((state) => state.favorites?.byId);
  const restaurantIds = useSelector((state) =>
    Object.keys(state.restaurants.nearby?.byId)
  );
  const restaurantDetails = useSelector(
    (state) => state.restaurants.nearby?.byId
  );
  const userId = useSelector((state) => state.session.user?.id);

  // Retrieve the user's location when the component mounts
  useEffect(() => {
    setSelectedLocation(JSON.parse(localStorage.getItem("userLocation")));
  }, []);

  // Refetch restaurant data when the location changes
  useEffect(() => {
    if (selectedLocation) {
      const { lat, lng, city, state, country } = selectedLocation;
      dispatch(thunkGetNearbyRestaurants(lat, lng, city, state, country));
    }
  }, [selectedLocation, dispatch]);

  /**
   * Handles the click event on the favorite button.
   * Adds or removes the restaurant from the favorites list based on its current status.
   *
   * @param {string} restaurantId - The ID of the clicked restaurant.
   */
  const handleFavoriteClick = (restaurantId) => {
    if (userId) {
      const favoriteKey = Object.keys(favoritesById).find(
        (key) => favoritesById[key].restaurant_id === parseInt(restaurantId)
      );

      if (favoriteKey) {
        // If the restaurant is in favorites, remove it
        dispatch(thunkRemoveFavorite(favoriteKey));
      } else {
        // If the restaurant is not in favorites, add it
        const data = {
          user_id: userId,
          restaurant_id: restaurantId,
        };

        dispatch(thunkAddFavorite(data.user_id, data.restaurant_id));
      }
    }
  };

  // Render the list of nearby restaurants, including their details and favorite status.
  return (
    <div className="restaurant-list">
      {restaurantIds &&
        restaurantIds?.map((id) => {
          const restaurant = restaurantDetails[id];
          const isFavorite = !!Object.values(favoritesById).find(
            (fav) => fav.restaurant_id === parseInt(id)
          );

          return (
            <div key={restaurant.google_place_id} className="restaurant-card" title={restaurant.name}>
              <img
                src={restaurant.banner_image_path}
                alt="Restaurant Icon"
                className="restaurant-image"
              />

              <FontAwesomeIcon
                icon={isFavorite ? solidHeart : regularHeart}
                className={`favorite-heart ${isFavorite ? "favorited" : ""}`}
                onClick={() => handleFavoriteClick(id)}
                style={{ color: "#fafafa" }}
              />

              <div className="restaurant-details">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="restaurant-address">
                  Address: {restaurant.street_address}
                </p>
                <p className="restaurant-rating">
                  Rating: {restaurant.average_rating} (
                  {restaurant.user_ratings_total} ratings)
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
}
