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
} from "../../../store/restaurants";
import DeleteRestaurant from "../DeleteRestaurant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import "./GetRestaurants.css";

export default function GetRestaurants({ ownerMode = false }) {
  // Hook to allow component to dispatch actions to the Redux store
  const dispatch = useDispatch();
  // Hook to navigate programmatically with React Router
  const navigate = useNavigate();
  const lastFetchedUserIdRef = useRef(null);




  // Component state to manage the user's selected location
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Extracting necessary data from the Redux state
  const favoritesById = useSelector((state) => state.favorites?.byId, shallowEqual);
  // const ownerRestaurants = useSelector((state) => state.restaurants.owner || {});
  const ownerRestaurants = useSelector((state) => state.restaurants.owner?.byId || {}, shallowEqual);

  const nearbyRestaurants = useSelector(
    (state) => state.restaurants.nearby?.byId || {}, shallowEqual
  );

  const restaurantDetails = ownerMode ? ownerRestaurants : nearbyRestaurants;
  console.log("Restaurant details:", restaurantDetails);

  const restaurantIds = Object.keys(restaurantDetails);

  const userId = useSelector((state) => state.session.user?.id, shallowEqual);

  //********************************************************************************************** */
  // // Effect to initialize user location and fetch favorites if user is logged in
  // useEffect(() => {
  //   setSelectedLocation(JSON.parse(localStorage.getItem("userLocation")));
  //   if (userId) {
  //     dispatch(thunkFetchAllFavorites(userId));
  //   }
  // }, [dispatch, userId]);

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

  //********************************************************************************************** */
//   useEffect(() => {
//     // Check if the current userId is different from the last fetched user ID
//     if (userId && userId !== lastFetchedUserIdRef.current) {
//         dispatch(thunkFetchAllFavorites(userId));

//         // Update the last fetched user ID
//         lastFetchedUserIdRef.current = userId;
//     }
// }, [dispatch, userId]);


  // Effect to fetch nearby restaurants based on the user's selected location
  // useEffect(() => {
  //   if (selectedLocation) {
  //     const { lat, lng, city, state, country } = selectedLocation;
  //     dispatch(thunkGetNearbyRestaurants(lat, lng, city, state, country));
  //   }
  // }, [selectedLocation, dispatch]);
  useEffect(() => {
    if (selectedLocation) {
      const { lat, lng, city, state, country } = selectedLocation;
      if (ownerMode) {
        dispatch(thunkGetOwnerRestaurants());
      } else {
        dispatch(thunkGetNearbyRestaurants(lat, lng, city, state, country));
      }
    }
  }, [selectedLocation, dispatch, ownerMode]);

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
  console.log("*********************************",{
    userId,
    selectedLocation,
    favoritesById,
    ownerRestaurants,
    nearbyRestaurants,
    restaurantIds,
  });

  // Render the list of nearby restaurants
  return (
    <div className="restaurant-list">
      {restaurantIds.length === 0 ? (
        // Display message if no restaurants are found
        <p>No restaurants found.</p>
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
              {ownerMode && (
                <div className="owner-buttons">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit-restaurant/${id}`);
                    }}
                  >
                    Edit
                  </button>
                  <DeleteRestaurant restaurantId={id} />
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add your delete function here
                    }}
                  >
                    Delete
                  </button> */}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

//   return (
//     <div className="restaurant-list">
//       {restaurantIds &&
//         restaurantIds.map((id) => {
//           console.log("favoritesByIds:", favoritesById);
//           const restaurant = restaurantDetails[id];
//           const isFavorite = !!Object.values(favoritesById).find(
//             (fav) => fav.restaurant_id === parseInt(id)
//           );

//           const restaurantKey = restaurant.google_place_id || id;
//           return (
//             <Link
//               to={`/restaurants/${id}`}
//               key={restaurantKey}
//               className="restaurant-card"
//               title={restaurant.name}
//             >
//               <div
//                 key={restaurantKey}
//                 className="restaurant-card"
//                 title={restaurant.name}
//               >
//                 <img
//                   src={restaurant.banner_image_path}
//                   alt="Restaurant Icon"
//                   className="restaurant-image"
//                 />
//                 <FontAwesomeIcon
//                   icon={isFavorite ? solidHeart : regularHeart}
//                   className={`favorite-heart`}
//                   onClick={(e) => handleFavoriteClick(e, id)}
//                 />
//                 <div className="restaurant-details">
//                   <h3 className="restaurant-name">{restaurant.name}</h3>
//                   <p className="restaurant-address">
//                     Address: {restaurant.street_address}
//                   </p>
//                   <p className="restaurant-rating">
//                     Rating: {restaurant.average_rating} (
//                     {restaurant.user_ratings_total} ratings)
//                   </p>
//                 </div>
//               </div>
//             </Link>
//           );
//         })}
//     </div>
//   );
// }
