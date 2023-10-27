import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import MoreInfoModal from "./MoreInfoModal";
import OpenModalButton from "../../Modals/OpenModalButton/index";
import { thunkGetRestaurantDetails } from "../../../store/restaurants";
import {
  thunkToggleFavorite,
  thunkFetchAllFavorites,
} from "../../../store/favorites";
import "./RestaurantDetail.css";
import mapImage from "../../../assets/mapImage.png";

export default function RestaurantDetail() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const restaurantData = useSelector(
    (state) => state.restaurants.singleRestaurant
  );

  // Extract relevant data from the nested structure
  const restaurant = restaurantData.entities?.restaurants.byId[restaurantId];
  const menuItems = restaurantData.entities?.menuItems || {};
  const owner = restaurantData.entities?.owner || {};
  const userId = useSelector((state) => state.session.user?.id);
  const favoritesById = useSelector((state) => state.favorites?.byId);

  // State to track whether the restaurant is favorited
  const [isFavorite, setIsFavorite] = useState(
    !!favoritesById[restaurantId] // Initialize with whether the restaurant is in favorites
  );

  // Function to handle favorite click
  const handleFavoriteClick = async (e, restaurantId) => {
    e.stopPropagation();
    if (userId) {
      dispatch(thunkToggleFavorite(userId, restaurantId));
      setIsFavorite(!isFavorite); // Toggle the favorite state
    }
  };

  useEffect(() => {
    dispatch(thunkGetRestaurantDetails(restaurantId));
  }, [dispatch, restaurantId]);

  useEffect(() => {
    // setSelectedLocation(JSON.parse(localStorage.getItem("userLocation")));
    if (userId) {
      dispatch(thunkFetchAllFavorites(userId));
    }
  }, [dispatch, userId]);

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
        <FontAwesomeIcon
          icon={isFavorite ? solidHeart : regularHeart}
          className="favorite-heart"
          onClick={(e) => handleFavoriteClick(e, restaurantId)}
        />
      </div>
      <h1 className="restaurant-name">{restaurant.name}</h1>
      <div className="avgRating-numberOfReviews-container">
        <span className="avgRating-numberOfReviews-span">
          ★{" "}
          {restaurant.average_rating !== null &&
          restaurant.average_rating !== undefined ? (
            restaurant.average_rating
          ) : (
            <span className="boldText">New</span>
          )}
        </span>
        {restaurant.num_reviews > 0 && (
          <div className="num_reviews-food_type-moreInfo-div">
            {`(${restaurant.num_reviews}${
              restaurant.num_reviews === 1 ? " review" : " reviews"
            }) • ${restaurant.food_type} ɵ`}{" "}

            <OpenModalButton
              modalComponent={<MoreInfoModal restaurant={restaurant} />}
              buttonText="More info"
            />
          </div>
        )}
      </div>

      <div className="menu-items">
        <h2>Menu Items</h2>
        <ul>
          {Object.values(menuItems).map((menuItem) => (
            <li key={menuItem.id} className="menu-item">
              <div className="menu-item-name-price">
                <p className="menu-item-name">{menuItem.name}</p>
                <p className="menu-item-price">${menuItem.price}</p>
              </div>
              <p className="menu-item-description">{menuItem.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="owner-info">
        <h2>Owner</h2>
        <p>
          Name: {owner.first_name} {owner.last_name}
        </p>
        <p>Email: {owner.email}</p>
      </div>
    </div>
  );
}
