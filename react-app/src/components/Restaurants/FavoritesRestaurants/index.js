/**
 * FavoritesRestaurants Component
 *
 * This component is responsible for displaying a list of the user's favorite restaurants.
 * It allows users to view their favorite restaurants and provides the functionality to
 * remove a restaurant from the favorites list.
 */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkFetchAllFavorites,
  thunkToggleFavorite,
} from "../../../store/favorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as solidHeart,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons"; 
import "../GetRestaurants/GetRestaurants.css";

export default function FavoritesRestaurants() {
  const dispatch = useDispatch();

  // Extract the user ID from the Redux store
  const userId = useSelector((state) => state.session.user?.id);

  // Extract favorite restaurants and all restaurant details from the Redux store
  const favoritesById = useSelector((state) => state.favorites?.byId);
  const allRestaurants = useSelector(
    (state) => state.favorites.allRestaurants?.byId
  );

  // Extract all restaurants that are marked as favorites
  const allFavoriteRestaurants = useSelector((state) => {
    const favoriteRestaurants = state.favorites.favoriteRestaurants || {};
    return Object.values(favoriteRestaurants);
  });

  // Fetch all favorites for the user when the component mounts
  useEffect(() => {
    if (userId) {
      dispatch(thunkFetchAllFavorites(userId));
    }
  }, [dispatch, userId]);

  /**
   * Handle click event for toggling a restaurant's favorite status.
   *
   * @param {Object} e - The event object.
   * @param {number} restaurantId - The ID of the restaurant.
   */
  const handleFavoriteClick = (e, restaurantId) => {
    e.stopPropagation();
    if (userId) {
      dispatch(thunkToggleFavorite(userId, restaurantId));
    }
  };

  const hasFavorites = allFavoriteRestaurants.length > 0;

  return (
    <>
      {/* Navigation link to go back to the main page */}
      <div className="Back-to-Nearby-Restaurant">
        <a href="/">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Main Page
        </a>
      </div>

      {/* Display the list of favorite restaurants */}
      <div
        className={`restaurant-list ${
          hasFavorites ? "with-favorites" : "no-favorites"
        }`}
      >
        {allFavoriteRestaurants.map((restaurant) => {
          // Use the Google Place ID for the restaurant as the key, if available. Otherwise, use the restaurant ID.
          const restaurantKey = restaurant.google_place_id || restaurant.id;

          return (
            <div
              key={restaurantKey}
              className="restaurant-card"
              title={restaurant.name}
            >
              {/* Restaurant banner image */}
              <img
                src={restaurant.banner_image_path}
                alt={`Banner for ${restaurant.name}`}
                className="restaurant-image"
              />

              {/* Heart icon indicating favorite status. Can be toggled by clicking. */}
              <FontAwesomeIcon
                icon={solidHeart}
                className="favorite-heart"
                onClick={(e) => handleFavoriteClick(e, restaurant.id)}
              />

              <div className="restaurant-details">
                {/* Display the restaurant's name, address, and rating */}
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
    </>
  );
}
