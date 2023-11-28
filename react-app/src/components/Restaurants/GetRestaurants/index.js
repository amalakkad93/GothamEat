/**
 * NearbyRestaurants Component
 *
 * This component is responsible for displaying a list of restaurants located near the user's location.
 * It showcases each restaurant's details, including name, address, rating, and favorite status.
 */
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  thunkToggleFavorite,
  thunkFetchAllFavorites,
} from "../../../store/favorites";
import {
  thunkGetNearbyRestaurants,
  thunkGetOwnerRestaurants,
  thunkGetAllRestaurants,
} from "../../../store/restaurants";
import DeleteRestaurant from "../DeleteRestaurant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { faFrownOpen } from "@fortawesome/free-solid-svg-icons";

import "./GetRestaurants.css";

export default function GetRestaurants({ mode = "nearby" }) {
  // Hook to allow component to dispatch actions to the Redux store
  const dispatch = useDispatch();
  // Hook to navigate programmatically with React Router
  const navigate = useNavigate();
  const lastFetchedUserIdRef = useRef(null);

  // Component state to manage the user's selected location
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Extracting necessary data from the Redux state
  const favoritesById = useSelector(
    (state) => state.favorites?.byId,
    shallowEqual
  );
  const ownerRestaurants = useSelector(
    (state) => state.restaurants.owner?.byId || {},
    shallowEqual
  );

  const nearbyRestaurants = useSelector(
    (state) => state.restaurants.nearby?.byId || {},
    shallowEqual
  );
  const allRestaurants = useSelector(
    (state) => state.restaurants.allRestaurants?.byId || {},
    shallowEqual
  );
  // const restaurantDetails = ownerMode ? ownerRestaurants : nearbyRestaurants;
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  let restaurantDetails;
  switch (mode) {
    case "owner":
      restaurantDetails = ownerRestaurants;
      break;
    case "all":
      restaurantDetails = allRestaurants;
      break;
    case "nearby":
    default:
      restaurantDetails = nearbyRestaurants;
      break;
  }
  const restaurantIds = Object.keys(restaurantDetails);

  const userId = useSelector((state) => state.session.user?.id, shallowEqual);

  useEffect(() => {
    try {
      const location = JSON.parse(localStorage.getItem("userLocation"));
      if (location && location.lat && location.lng) {
        setSelectedLocation(location);
      } else {
        console.log("No valid userLocation found in localStorage.");
      }
    } catch (error) {
      console.error("Error parsing userLocation from localStorage:", error);
    }

    if (userId) {
      dispatch(thunkFetchAllFavorites(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    // Effect for 'nearby' and 'owner' modes
    if (selectedLocation && (mode === "nearby" || mode === "owner")) {
      const { lat, lng, city, state, country } = selectedLocation;
      if (mode === "owner") {
        dispatch(thunkGetOwnerRestaurants());
      } else {
        // mode is 'nearby'
        dispatch(thunkGetNearbyRestaurants(lat, lng, city, state, country));
      }
    }
  }, [selectedLocation, mode, dispatch]);

  useEffect(() => {
    if (mode === "all") {
      dispatch(thunkGetAllRestaurants(currentPage, perPage));
    }
  }, [currentPage, perPage, mode, dispatch]);
  /**
   * handleFavoriteClick
   *
   * This function toggles the favorite status of a restaurant for the logged-in user.
   *
   * @param {Object} e - The event object.
   * @param {number} restaurantId - The ID of the restaurant.
   */
  const handleFavoriteClick = async (e, restaurantId) => {
    e.stopPropagation();
    if (userId) {
      dispatch(thunkToggleFavorite(userId, restaurantId));
    }
  };
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Check if there are no restaurants found in the nearby mode
  const showNoRestaurantsMessage =
    mode === "nearby" && restaurantIds.length === 0;
  // Render the list of nearby restaurants
  return (
    <div className="restaurant-list">
      {showNoRestaurantsMessage ? (
        <div className="no-restaurants-card">
          <FontAwesomeIcon icon={faFrownOpen} className="no-restaurants-icon" />
          <p className="no-restaurants-text">
            We do not have servers in this area yet.
          </p>
          <button
            onClick={() => navigate("/restaurants/all")}
            className="explore-all-button"
          >
            Explore All Restaurants
          </button>
        </div>
      ) : (
        // Iterate over the list of restaurant IDs to render each restaurant's details
        restaurantIds.map((id) => {
          const restaurant = restaurantDetails[id];

          // Determine if the current restaurant is marked as a favorite by the user
          const isFavorite = !!Object.values(favoritesById).find(
            (fav) => fav.restaurant_id === parseInt(id)
          );

          // Use the Google Place ID for the restaurant as the key, if available. Otherwise, use the restaurant ID.
          const restaurantKey = restaurant.google_place_id || id;

          return (
            <div
              key={restaurantKey}
              className="restaurant-card"
              title={restaurant.name}
              // Navigate to the detailed page of the clicked restaurant
              onClick={() => navigate(`/restaurants/${id}`)}
            >
              {/* Restaurant banner image */}
              <img
                src={restaurant.banner_image_path}
                alt={`Banner for ${restaurant.name}`}
                className="restaurant-image"
              />

              {/* Heart icon indicating favorite status. Can be toggled by clicking. */}
              <FontAwesomeIcon
                icon={isFavorite ? solidHeart : regularHeart}
                className="favorite-heart"
                onClick={(e) => handleFavoriteClick(e, id)}
              />

              <div className="restaurant-details">
                {/* Display the restaurant's name */}
                <h3 className="restaurant-name">{restaurant.name}</h3>

                {/* Display the restaurant's address */}
                <p className="restaurant-address">
                  Address: {restaurant.street_address}
                </p>

                {/* Display the restaurant's average rating and total number of ratings */}
                <p className="restaurant-rating">
                  Rating: {restaurant.average_rating} (
                  {restaurant.user_ratings_total} ratings)
                </p>
              </div>
              {/* Conditionally render edit and delete buttons */}
              {mode === "owner" && (
                <div className="owner-buttons">
                  <button
                    className="edit-rest-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit-restaurant/${id}`);
                    }}
                  >
                    Edit
                  </button>
                  <DeleteRestaurant restaurantId={id} />
                </div>
              )}
            </div>
          );
        })
      )}
      {mode === "all" && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="pagination-button"
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      )}
    </div>
  );
}
