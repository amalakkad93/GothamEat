import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import MoreInfoModal from "./MoreInfoModal";
import OpenModalButton from "../../Modals/OpenModalButton/index";
import MenuSection from "../../MenuItems";
import GetReviews from "../../Reviews/GetReviews";
import CreateReview from "../../Reviews/CreateReview";
import { thunkGetRestaurantDetails } from "../../../store/restaurants";
import { thunkGetMenuItemsByRestaurantId } from "../../../store/menuItems";
import {
  thunkToggleFavorite,
  thunkFetchAllFavorites,
} from "../../../store/favorites";
import "./RestaurantDetail.css";

export default function RestaurantDetail() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.session.user);
  const restaurantData = useSelector(
    (state) => state.restaurants?.singleRestaurant
  );
  // const menuItemsByRestaurant = useSelector((state) => state.menuItems?.menuItemsByRestaurant?.[restaurantId] || {});
  const menuItemsByRestaurant = useSelector(
    (state) => state.menuItems?.menuItemsByRestaurant?.[restaurantId] || {}
  );

  console.log("Menu Items By Restaurant:", menuItemsByRestaurant);

  const menuItemImages = useSelector(
    (state) => state.menuItems.menuItemImages?.byId || {}
  );

  const restaurant = restaurantData.entities?.restaurants?.byId[restaurantId];
  const owner = restaurantData.entities?.owner || {};

  const userId = useSelector((state) => state.session.user?.id);
  const favoritesById = useSelector((state) => state.favorites?.byId);
  const restaurantError = useSelector((state) => state.restaurants.error);
  // Convert the items into an array
  const convertItemsToArray = (itemsObj) => {
    return itemsObj && itemsObj.byId ? Object.values(itemsObj.byId) : [];
  };
  const menuItemsTypes = useSelector((state) => state.menuItems?.types || {});

  console.log("***********menuItemsTypes:", menuItemsTypes);

  console.log("***********convertItemsToArray:", convertItemsToArray);
  const [isFavorite, setIsFavorite] = useState(!!favoritesById[restaurantId]);

  // Handle favorite click
  const handleFavoriteClick = async (e, restaurantId) => {
    e.stopPropagation();
    if (userId) {
      dispatch(thunkToggleFavorite(userId, restaurantId));
      setIsFavorite(!isFavorite);
    }
  };

  useEffect(() => {
    dispatch(thunkGetRestaurantDetails(restaurantId));
    dispatch(thunkGetMenuItemsByRestaurantId(restaurantId));
  }, [dispatch, restaurantId]);

  useEffect(() => {
    if (userId) {
      dispatch(thunkFetchAllFavorites(userId));
    }
  }, [dispatch, userId]);

  if (restaurantError) {
    return <p>Error: {restaurantError}</p>;
  }

  if (!restaurant) {
    return <p>Loading...</p>;
  }

  // Render restaurant details
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

      {/* Menu items section */}
      <h2 className="restaurant-detail-titles-h2">Menu Items</h2>
      <div className="menu-items-container">
        {Object.entries(menuItemsTypes).map(([type, itemIds]) => {
          // Extract items for this type using the itemIds
          const itemsOfType = itemIds
            .map((id) => menuItemsByRestaurant.byId[id])
            .filter(Boolean);
          return (
            <MenuSection
              key={type}
              type={type}
              items={itemsOfType}
              menuItemImgs={menuItemImages}
            />
          );
        })}
      </div>
      {/* Customer Reviews section */}
      <div className="reviews-section">
        <h2 className="restaurant-detail-titles-h2">Customer Reviews</h2>
        {currentUser && <CreateReview restaurantId={restaurantId} />}

      <GetReviews restaurantId={restaurantId} />
        <GetReviews restaurantId={restaurantId} />
      </div>

      {/* Owner information */}
      <div className="owner-info">
        <h2 className="restaurant-detail-titles-h2">Owner</h2>
        <p>
          Name: {owner.first_name} {owner.last_name}
        </p>
        <p>Email: {owner.email}</p>
      </div>
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
// import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
// import MoreInfoModal from "./MoreInfoModal";
// import OpenModalButton from "../../Modals/OpenModalButton/index";
// import MenuSection from "../../MenuItems";
// import { thunkGetRestaurantDetails } from "../../../store/restaurants";
// import {
//   thunkToggleFavorite,
//   thunkFetchAllFavorites,
// } from "../../../store/favorites";
// import "./RestaurantDetail.css";

// // RestaurantDetail component
// export default function RestaurantDetail() {
//   const { restaurantId } = useParams();
//   const dispatch = useDispatch();
//   const restaurantData = useSelector(
//     (state) => state.restaurants.singleRestaurant
//   );

//   // Extract relevant data
//   const restaurant = restaurantData.entities?.restaurants.byId[restaurantId];
//   const menuItemsByType = restaurantData.entities?.menuItemsByType || {};
//   const menuItems = {
//     ...menuItemsByType.desserts?.byId,
//     ...menuItemsByType.drinks?.byId,
//     ...menuItemsByType.entrees?.byId,
//     ...menuItemsByType.sides?.byId,
//   };

//   const owner = restaurantData.entities?.owner || {};
//   const menuItemImgs = restaurantData.entities?.menuItemImgs?.byId || {};

//   const userId = useSelector((state) => state.session.user?.id);
//   const favoritesById = useSelector((state) => state.favorites?.byId);
//   const restaurantError = useSelector((state) => state.restaurants.error);
//   const [isFavorite, setIsFavorite] = useState(!!favoritesById[restaurantId]);

//   console.log("***restaurantData:", restaurantData);
//   console.log("***restaurant:", restaurant);
//   console.log("***menuItems:", menuItems);
//   console.log("***owner:", owner);
//   console.log("***menuItemImgs:", menuItemImgs);
//   // Handle favorite click
//   const handleFavoriteClick = async (e, restaurantId) => {
//     e.stopPropagation();
//     if (userId) {
//       dispatch(thunkToggleFavorite(userId, restaurantId));
//       setIsFavorite(!isFavorite);
//     }
//   };

//   useEffect(() => {
//     dispatch(thunkGetRestaurantDetails(restaurantId));
//   }, [dispatch, restaurantId]);

//   useEffect(() => {
//     if (userId) {
//       dispatch(thunkFetchAllFavorites(userId));
//     }
//   }, [dispatch, userId]);

//   if (restaurantError) {
//     return <p>Error: {restaurantError}</p>;
//   }

//   // Render Loading... if restaurant data isn't available
//   if (!restaurant) {
//     return <p>Loading...</p>;
//   }

//   // Render restaurant details
//   return (
//     <div className="restaurant-detail-container">
//       <div
//         className="restaurant-banner"
//         style={{ backgroundImage: `url(${restaurant.banner_image_path})` }}
//       >
//         <FontAwesomeIcon
//           icon={isFavorite ? solidHeart : regularHeart}
//           className="favorite-heart"
//           onClick={(e) => handleFavoriteClick(e, restaurantId)}
//         />
//       </div>
//       <h1 className="restaurant-name">{restaurant.name}</h1>
//       <div className="avgRating-numberOfReviews-container">
//         <span className="avgRating-numberOfReviews-span">
//           ★{" "}
//           {restaurant.average_rating !== null &&
//           restaurant.average_rating !== undefined ? (
//             restaurant.average_rating
//           ) : (
//             <span className="boldText">New</span>
//           )}
//         </span>
//         {restaurant.num_reviews > 0 && (
//           <div className="num_reviews-food_type-moreInfo-div">
//             {`(${restaurant.num_reviews}${
//               restaurant.num_reviews === 1 ? " review" : " reviews"
//             }) • ${restaurant.food_type} ɵ`}{" "}
//             <OpenModalButton
//               modalComponent={<MoreInfoModal restaurant={restaurant} />}
//               buttonText="More info"
//             />
//           </div>
//         )}
//       </div>

//       {/* Menu items section */}
//       <div className="menu-items">
//         <h2>Menu Items</h2>
//         <div className="menu-items-container">
//           {Object.entries(menuItemsByType).map(([type, itemsGroup]) => {
//             return (
//               <MenuSection
//                 key={type}
//                 type={type}
//                 items={Object.values(itemsGroup.byId || {})}
//                 menuItemImgs={menuItemImgs}
//               />
//             );
//           })}
//         </div>
//       </div>

//       {/* Owner information */}
//       <div className="owner-info">
//         <h2>Owner</h2>
//         <p>
//           Name: {owner.first_name} {owner.last_name}
//         </p>
//         <p>Email: {owner.email}</p>
//       </div>
//     </div>
//   );
// }
