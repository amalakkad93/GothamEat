import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  thunkToggleFavorite,
  thunkFetchAllFavorites,
} from "../../../store/favorites";
import { thunkGetNearbyRestaurants } from "../../../store/restaurants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import "./GetNearbyRestaurants.css";

export default function NearbyRestaurants() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(false);

  // Extracting necessary data from the Redux state
  const favoritesById = useSelector((state) => state.favorites?.byId);
  const restaurantIds = useSelector((state) =>
    Object.keys(state.restaurants.nearby?.byId)
  );
  const restaurantDetails = useSelector(
    (state) => state.restaurants.nearby?.byId
  );
  const userId = useSelector((state) => state.session.user?.id);



  useEffect(() => {
    setSelectedLocation(JSON.parse(localStorage.getItem("userLocation")));
    if (userId) {
      dispatch(thunkFetchAllFavorites(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (selectedLocation) {
      const { lat, lng, city, state, country } = selectedLocation;
      dispatch(thunkGetNearbyRestaurants(lat, lng, city, state, country));
    }
  }, [selectedLocation, dispatch]);

  const handleFavoriteClick = async (e, restaurantId) => {
    e.stopPropagation();
    if (userId) {
      dispatch(thunkToggleFavorite(userId, restaurantId));
      // setForceUpdate(!forceUpdate);
    }
  };
  return (
    <div className="restaurant-list">
      {restaurantIds &&
        restaurantIds.map((id) => {
          console.log("favoritesByIds:", favoritesById);
          const restaurant = restaurantDetails[id];
          const isFavorite = !!Object.values(favoritesById).find(
            (fav) => fav.restaurant_id === parseInt(id)
          );

          const restaurantKey = restaurant.google_place_id || id;
          return (
            <div
              key={restaurantKey}
              className="restaurant-card"
              title={restaurant.name}
              onClick={() => navigate(`/restaurants/${id}`)}
            >
                <img
                  src={restaurant.banner_image_path}
                  alt="Restaurant Icon"
                  className="restaurant-image"
                />
                <FontAwesomeIcon
                  icon={isFavorite ? solidHeart : regularHeart}
                  className={`favorite-heart`}
                  onClick={(e) => handleFavoriteClick(e, id)}
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
