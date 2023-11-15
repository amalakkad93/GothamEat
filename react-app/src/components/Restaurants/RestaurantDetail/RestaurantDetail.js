import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as solidHeart,
  faHeart as regularHeart,
} from "@fortawesome/free-solid-svg-icons";
import MoreInfoModal from "./MoreInfoModal";
import OpenModalButton from "../../Modals/OpenModalButton/index";
import MenuSection from "../../MenuItems/GetMenuItems";
import CreateMenuItemForm from "../../MenuItems/MenuItemForm/CreateMenuItemForm";
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
  const isMountedRef = useRef(true);


  // Redux state selectors
  const {
    currentUser, restaurantData, menuItemsByRestaurant, menuItemImages, reviewImages,
    userId, favoritesById, menuItemsTypes, reviews
  } = useSelector(state => ({
    currentUser: state.session?.user,
    restaurantData: state.restaurants?.singleRestaurant,
    menuItemsByRestaurant: state.menuItems?.menuItemsByRestaurant?.[restaurantId] || {},
    menuItemImages: state.menuItems.menuItemImages || {},
    reviewImages: state.reviews.reviewImages || {},
    userId: state.session.user?.id,
    favoritesById: state.favorites?.byId,
    menuItemsTypes: state.menuItems?.types || {},
    reviews: state.reviews?.reviews || {},
  }));

  const [loading, setLoading] = useState(true);
  const [reloadPage, setReloadPage] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const userHasReview = currentUser && Object.values(reviews).some(review => review.user_id === currentUser.id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(thunkGetRestaurantDetails(restaurantId)),
        dispatch(thunkGetMenuItemsByRestaurantId(restaurantId))
      ]);
      setLoading(false);
    };

    fetchData();

    if (userId && isMountedRef.current) {
      dispatch(thunkFetchAllFavorites(userId));
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [dispatch, restaurantId, userId]);

  useEffect(() => {
    setIsFavorite(!!favoritesById && !!favoritesById[restaurantId]);
  }, [favoritesById, restaurantId]);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (userId) {
      dispatch(thunkToggleFavorite(userId, restaurantId));
      setIsFavorite((prevIsFavorite) => !prevIsFavorite);
    }
  };

  if (loading) return <p>Loading...</p>;

  const restaurant = restaurantData?.byId[restaurantId];
  if (!restaurant) return <p>Restaurant not found.</p>;
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
              const item = menuItemsByRestaurant?.byId
                ? menuItemsByRestaurant.byId[id]
                : undefined;

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
              restaurantId={restaurantId}
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

        {!userHasReview &&
          currentUser &&
          currentUser.id !== restaurant.owner_id && (
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
        <GetReviews
          restaurantId={restaurantId}
          reviewImages={reviewImages}
          setReloadPage={setReloadPage}
        />
      </div>
    </div>
  );
}
