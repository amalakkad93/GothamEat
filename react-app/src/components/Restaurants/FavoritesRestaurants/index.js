import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchAllFavorites, thunkToggleFavorite } from "../../../store/favorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart, faArrowLeft } from "@fortawesome/free-solid-svg-icons"; // Import faArrowLeft for the back icon
import '../GetNearbyRestaurants/GetNearbyRestaurants.css';

export default function FavoritesRestaurants() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.session.user?.id);

  // Fetch favorite restaurants
  const favoritesById = useSelector((state) => state.favorites?.byId);
  const allRestaurants = useSelector((state) => state.favorites.allRestaurants?.byId);

  // Fetch all restaurants that are in the favorites list
  const allFavoriteRestaurants = useSelector((state) => {
    const favoriteRestaurants = state.favorites.favoriteRestaurants || {};
    return Object.values(favoriteRestaurants);
  });

  useEffect(() => {
    if (userId) {
      dispatch(thunkFetchAllFavorites(userId));
    }
  }, [dispatch, userId]);

  const handleFavoriteClick = (e, restaurantId) => {
    e.stopPropagation();
    if (userId) {
        dispatch(thunkToggleFavorite(userId, restaurantId));
    }
  };

  const hasFavorites = allFavoriteRestaurants.length > 0;

  return (
    <>
      <div className="Back-to-Nearby-Restaurant">
        <a href="/">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Main Page
        </a>
      </div>
      <div className={`restaurant-list ${hasFavorites ? 'with-favorites' : 'no-favorites'}`}>
        {allFavoriteRestaurants.map(restaurant => {
          const restaurantKey = restaurant.google_place_id || restaurant.id;

          return (
            <div key={restaurantKey} className="restaurant-card" title={restaurant.name}>
              <img
                src={restaurant.banner_image_path}
                alt="Restaurant Icon"
                className="restaurant-image"
              />
              <FontAwesomeIcon
                icon={solidHeart}
                className="favorite-heart"
                onClick={(e) => handleFavoriteClick(e, restaurant.id)}
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
    </>
  );
}
