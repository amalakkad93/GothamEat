
import { fetch } from "./csrf";

/**
 * =========================================================
 *                  FAVORITES REDUX MODULE
 * =========================================================
 * This module contains the Redux setup related to handling
 * operations about user favorites for restaurants.
 *
 * Contains:
 * - Action types
 * - Action creators
 * - Thunks (for asynchronous operations)
 * - Reducer (to modify the state based on actions)
 */

// =========================================================
//              ****action types****
// =========================================================
// Action types help in identifying which action is being dispatched.

/** Action type to set all user favorites in the store */
const SET_ALL_FAVORITES = "favorites/SET_ALL_FAVORITES";

/** Action type to get all favorited restaurants for a user */
const GET_ALL_FAVORITES_RESTAURANTS = "restaurants/GET_ALL_FAVORITES_RESTAURANTS";

/** Action type to add a favorite for a user */
const ADD_FAVORITE = "favorites/ADD_FAVORITE";

/** Action type to remove a favorite for a user */
const REMOVE_FAVORITE = "favorites/REMOVE_FAVORITE";

/** Action type to remove a favorited restaurant for a user */
const REMOVE_FAVORITE_RESTAURANT = "favorites/REMOVE_FAVORITE_RESTAURANT";

/** Action type to handle errors related to favorite operations */
const SET_FAVORITE_ERROR = "favorites/SET_FAVORITE_ERROR";

// =========================================================
//            ****action creator****
// =========================================================
// Action creators return the actions that our reducer will handle.

/** Creates an action to set all favorites in the store */
const actionSetAllFavorites = (allFavorites) => ({
  type: SET_ALL_FAVORITES,
  allFavorites,
});

/** Creates an action to set all favorited restaurants in the store */
const actionGetAllFavoritedRestaurants = (restaurants) => ({
  type: GET_ALL_FAVORITES_RESTAURANTS,
  payload: {
    byId: restaurants.reduce((acc, restaurant) => {
      acc[restaurant.id] = restaurant;
      return acc;
    }, {}),
    allIds: restaurants.map((restaurant) => restaurant.id),
  },
});

/** Creates an action to add a restaurant to favorites */
const actionAddFavorite = (favorite) => ({ type: ADD_FAVORITE, favorite });

/** Creates an action to remove a restaurant from favorites */
const actionRemoveFavorite = (favoriteId) => ({
  type: REMOVE_FAVORITE,
  favoriteId,
});

/** Creates an action to remove a restaurant's details from favorites */
const actionRemoveFavoriteRestaurant = (restaurantId) => ({
  type: REMOVE_FAVORITE_RESTAURANT,
  restaurantId,
});

/** Creates an action to handle errors during favorite operations */
const actionSetFavoriteError = (errorMessage) => ({
  type: SET_FAVORITE_ERROR,
  payload: errorMessage,
});

// =========================================================
//                   ****Thunks****
// =========================================================
// Thunks allow Redux to handle asynchronous operations.

// ***************************************************************
//  Thunk to Fetch All Favorites for a User
// ***************************************************************
/**
 * Fetches all favorites for a user based on their user ID.
 * Dispatches actions based on the result of the fetch operation.
 */
export const thunkFetchAllFavorites = (userId) => async (dispatch) => {
  // Check if the user's ID exists
  if (!userId) {
    throw new Error("User ID is required to fetch favorites.");
  }

  try {
    const response = await fetch(`/api/favorites?user_id=${userId}`);
    if (response.ok) {
      const allFavorites = await response.json();
      dispatch(actionSetAllFavorites(allFavorites));

      // Fetch detailed data for each favorited restaurant
      const restaurantIds = allFavorites.map((fav) => fav.restaurant_id);
      const restaurantDetails = await Promise.all(
        restaurantIds.map((id) => fetch(`/api/restaurants/${id}`))
      );

      // Process the restaurant details for dispatch
      const allFavoriteRestaurants = await Promise.all(
        restaurantDetails.map((res) => res.json())
      );
      const allFavoriteRestaurantsData = allFavoriteRestaurants.map(
        (item) => item.entities.restaurants.byId
      );
      const flatRestaurants = []
        .concat(...Object.values(allFavoriteRestaurantsData))
        .flat()
        .map((restaurant) => Object.values(restaurant)[0]);
      dispatch(actionGetAllFavoritedRestaurants(flatRestaurants));
    } else {
      // Handle response errors
      const errors = await response.json();
      dispatch(
        actionSetFavoriteError(errors.error || "Error fetching all favorites.")
      );
    }
  } catch (error) {
    dispatch(
      actionSetFavoriteError("An error occurred while fetching all favorites.")
    );
  }
};

// ***************************************************************
//  Thunk to Toggle Favorite Status for a Restaurant for a User
// ***************************************************************
/**
 * Toggles the favorite status of a restaurant for a user.
 * Dispatches actions based on the result of the operation.
 */
export const thunkToggleFavorite = (userId, restaurantId) => async (dispatch) => {
  try {
    // Make a post request to toggle the favorite status
    const response = await fetch("/api/favorites/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, restaurant_id: restaurantId }),
    });

    if (response.ok) {
      const responseData = await response.json();
      if (responseData.action === "added") {
        dispatch(actionAddFavorite(responseData.favorite));
      } else if (responseData.action === "removed") {
        dispatch(actionRemoveFavorite(responseData.favorite.id));
        dispatch(
          actionRemoveFavoriteRestaurant(responseData.favorite.restaurant_id)
        );
      }
    } else {
      // Handle response errors
      const errors = await response.json();
      dispatch(
        actionSetFavoriteError(errors.error || "Error toggling favorite.")
      );
    }
  } catch (error) {
    dispatch(
      actionSetFavoriteError("An error occurred while toggling favorite.")
    );
  }
};

// =========================================================
//                   ****Reducer****
// =========================================================
// The reducer calculates the new state based on the previous state and the dispatched action.

const initialFavoriteState = {
  byId: {},
  allIds: [],
  favoriteRestaurants: {},
  error: null,
};

/** Defines how the state should change for each action */
export default function favoritesReducer(state = initialFavoriteState, action) {
  let newById = {};
  switch (action.type) {
    case SET_ALL_FAVORITES:
      action.allFavorites.forEach((favorite) => {
        newById[favorite.id] = favorite;
      });
      return {
        ...state,
        byId: newById,
        allIds: action.allFavorites.map((fav) => fav.id),
      };
    case GET_ALL_FAVORITES_RESTAURANTS:
      return {
        ...state,
        favoriteRestaurants: action.payload.byId,
        allIds: [...new Set([...state.allIds, ...action.payload.allIds])],
      };

    case ADD_FAVORITE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.favorite.id]: action.favorite,
        },
        allIds: state.allIds.includes(action.favorite.id)
          ? state.allIds
          : [...state.allIds, action.favorite.id],
      };
    case REMOVE_FAVORITE:
      newById = { ...state.byId };
      delete newById[action.favoriteId];
      return {
        ...state,
        byId: newById,
        allIds: state.allIds.filter((id) => id !== action.favoriteId),
      };
    case REMOVE_FAVORITE_RESTAURANT:
      const updatedFavoriteRestaurants = { ...state.favoriteRestaurants };
      delete updatedFavoriteRestaurants[action.restaurantId];
      return {
        ...state,
        favoriteRestaurants: updatedFavoriteRestaurants,
      };

    case SET_FAVORITE_ERROR:
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
