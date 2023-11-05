/**
 * RestaurantDetail Component
 *
 * This component is responsible for rendering detailed information about a specific restaurant.
 * It displays restaurant details, menu items, reviews, and allows for user interactions such as marking
 * the restaurant as a favorite.
 */
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import MoreInfoModal from "./MoreInfoModal";
import OpenModalButton from "../../Modals/OpenModalButton/index";
import MenuSection from "../../MenuItems/GetMenuItems";
import CreateMenuItemForm from "../../MenuItems/MenuItemForm/CreateMenuItemForm";
import GetReviews from "../../Reviews/GetReviews";
import CreateReview from "../../Reviews/CreateReview";
import DeleteReview from "../../Reviews/DeleteReview";
import { thunkGetRestaurantDetails } from "../../../store/restaurants";
import { thunkGetMenuItemsByRestaurantId } from "../../../store/menuItems";
import {
  thunkToggleFavorite,
  thunkFetchAllFavorites,
} from "../../../store/favorites";
import "./RestaurantDetail.css";



export default function RestaurantDetail() {
  // Extract the restaurant ID from the URL using React Router's useParams
  const { restaurantId } = useParams();

  // Hook to allow component to dispatch actions to the Redux store
  const dispatch = useDispatch();

  // Reference to track if the component is still mounted - useful to prevent state updates on unmounted components
  const isMountedRef = useRef(true);
  // Redux state selectors to extract necessary data from the Redux store
  const currentUser = useSelector((state) => state.session?.user, shallowEqual);
  const restaurantData = useSelector((state) => state.restaurants?.singleRestaurant, shallowEqual);
  // console.log("Restaurant Data:", restaurantData);
  const menuItemsByRestaurant = useSelector((state) => state.menuItems?.menuItemsByRestaurant?.[restaurantId] || {}, shallowEqual);
  const menuItemImages = useSelector((state) => state.menuItems.menuItemImages || {}, shallowEqual);
  const reviewImages = useSelector((state) => state.reviews.reviewImages || {}, shallowEqual);

  // console.log("Full menuItemsByRestaurant:", menuItemsByRestaurant);

  // console.log("Menu item images:", menuItemImages);

  const userId = useSelector((state) => state.session.user?.id, shallowEqual);
  const favoritesById = useSelector((state) => state.favorites?.byId, shallowEqual);
  const restaurantError = useSelector((state) => state.restaurants.error, shallowEqual);
  const menuItemsTypes = useSelector((state) => state.menuItems?.types || {}, shallowEqual);
  // console.log("Menu item types:", menuItemsTypes);

  const reviews = useSelector((state) => state.reviews?.reviews || {}, shallowEqual);
  const reviewError = useSelector((state) => state.reviews.error, shallowEqual);
  // const userHasReview = useSelector((state) => state.reviews.userHasReview);
  // const userHasReview = currentUser && Object.values(reviews).some((review) => review.user_id === currentUser.id);
  const userHasReview = currentUser
    ? Object.values(reviews).some((review) => review.user_id === currentUser.id)
    : false;

  // console.log("*********userHasReview:", userHasReview);
  // Component state definitions:
  // State to manage the loading status or Track data loading status
  const [loading, setLoading] = useState(true);
  // State to trigger a re-fetch of data if needed
  const [reloadPage, setReloadPage] = useState(false);
  // Check if restaurant is user's favorite
  const [isFavorite, setIsFavorite] = useState(!!favoritesById[restaurantId]);

  // State to track if the user has posted a review
  const [hasPosted, setHasPosted] = useState(false);

  // Extract restaurant and owner details
  const restaurant = restaurantData?.byId[restaurantId] || null;
  console.log("Restaurant:", restaurant);

  // const restaurant =
  //   restaurantData?.entities?.restaurants?.byId?.[restaurantId] || null;

  // const owner = restaurantData.entities?.owner || {};

  const owner = restaurant?.owner_id || {};
  // const owner = useSelector(
  //   (state) => state.restaurants.owner || {}
  // );
  // console.log("Owner: ",owner)
  // console.log("currentUser : ",currentUser.id )
  // Determine if the logged-in user has already posted a review for the displayed restaurant
  // const userHasReview = Object.values(reviews).some((review) => review.user_id === currentUser.id);

  /**
   * handleFavoriteClick
   *
   * This function toggles the favorite status of the restaurant for the logged-in user.
   *
   * @param {Object} e - The event object.
   * @param {number} restaurantId - The ID of the restaurant.
   */
  const handleFavoriteClick = async (e, restaurantId) => {
    e.stopPropagation(); // Stop event propagation to parent elements
    if (userId) {
      // Update the favorite status in the Redux store and backend
      dispatch(thunkToggleFavorite(userId, restaurantId));
      // Toggle the local favorite state
      setIsFavorite(!isFavorite);
    }
  };



  // Effect to fetch the restaurant details and its menu items
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Begin loading
      await dispatch(thunkGetRestaurantDetails(restaurantId));
      await dispatch(thunkGetMenuItemsByRestaurantId(restaurantId));
      if (isMountedRef.current) {  // Check if the component is still mounted
        setLoading(false); // End loading after data fetch
      }
    };

    fetchData();
  }, [dispatch, restaurantId, reloadPage]);

  // Effect to fetch user's favorite restaurants
  useEffect(() => {
    // Check if the component is still mounted before dispatching
    if (userId && isMountedRef.current) {
      dispatch(thunkFetchAllFavorites(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Error and loading checks
  // Error handling: Show an error message if there's an issue fetching restaurant details


  // Loading state: Display a loading message until the restaurant data is fetched
  // if (loading || !restaurant) return <p>Loading...</p>;
  if (!restaurant) return <p>Restaurant not found.</p>;
  // if (!currentUser) return <p>Please log in to view restaurant details.</p>;



  // Render the detailed view of the restaurant
  return (
    <div className="restaurant-detail-container">
      {/* Display the restaurant banner image */}
      <div
        className="restaurant-banner"
        style={{ backgroundImage: `url(${restaurant?.banner_image_path})` }}
      >
        {/* Heart icon to show if the restaurant is a favorite. Clicking toggles favorite status. */}
        <FontAwesomeIcon
          icon={isFavorite ? solidHeart : regularHeart}
          className="favorite-heart"
          onClick={(e) => handleFavoriteClick(e, restaurantId)}
        />
      </div>

      {/* Display the restaurant's name */}
      <h1 className="restaurant-name">{restaurant.name}</h1>

      {/* Container for average rating and number of reviews */}
      <div className="avgRating-numberOfReviews-container">
        <span className="avgRating-numberOfReviews-span">
          ★{" "}
          {restaurant.average_rating !== null &&
          restaurant.average_rating !== undefined ? (
            restaurant.average_rating
          ) : (
            <span className="boldText">New</span> // Display 'New' if there's no rating yet
          )}
        </span>

        {/* If the restaurant has reviews, display the number and the food type. Also, provide a More Info button. */}
        {restaurant && restaurant.num_reviews > 0 && (
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
      {/* <h2 className="restaurant-detail-titles-h2">Menu Items</h2> */}

      {currentUser && restaurant?.owner_id === currentUser?.id && (
        <OpenModalButton
          className="add-menu-item-btn"
          buttonText="Add Menu Item"
          modalComponent={
            <CreateMenuItemForm
              restaurantId={restaurantId}
              setReloadPage={setReloadPage}
            />
          }
        />
      )}

      <div className="menu-items-container">
        {Object.entries(menuItemsTypes)?.map(([type, itemIds]) => {
          const itemsOfType = itemIds
            .map((id) => {
              console.log("****menuItemsByRestaurant: ", menuItemsByRestaurant);
              const item = menuItemsByRestaurant?.byId ? menuItemsByRestaurant.byId[id] : undefined;

              // console.log(`Item for ID ${id}:`, item);
              return item;
            })
            .filter((item) => {
              const exists = Boolean(item);
              if (!exists) console.log(`Filtered out item:`, item);
              return exists;
            });

          return (
            <MenuSection
              key={type}
              type={type}
              items={itemsOfType}
              menuItemImages={menuItemImages}
              setReloadPage={setReloadPage}
            />
          );
        })}
      </div>


      {/* Customer Reviews section */}
      <div className="reviews-section">
        <h2 className="avgRating-numofReviews">
          ★{" "}
          {restaurant.average_rating !== null &&
          restaurant.average_rating !== undefined ? (
            restaurant.average_rating.toFixed(1)
          ) : (
            <span className="boldText">New</span>
          )}
          {restaurant.num_reviews === 0 && ` · No reviews, be the first!`}
          {restaurant.num_reviews === 1 && ` · 1 review`}
          {restaurant.num_reviews > 1 && ` · ${restaurant.num_reviews} reviews`}
        </h2>

        {!userHasReview && currentUser && currentUser.id !== restaurant.owner_id && (

          <OpenModalButton
            className="post-delete-review-btn"
            buttonText="Post Your Review"
            modalComponent={
              <CreateReview
                restaurantId={restaurantId}
                setReloadPage={setReloadPage}
              />
            }
          />
        )}

        {/* Display all the reviews for the restaurant */}
        <GetReviews restaurantId={restaurantId} reviewImages={reviewImages} setReloadPage={setReloadPage} />
      </div>
    </div>
  );
}
