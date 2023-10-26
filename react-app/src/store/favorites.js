import { csrfFetch } from "./csrf";
// ************************************************
//                   ****types****
// ************************************************
const SET_ALL_FAVORITES = "favorites/SET_ALL_FAVORITES";
const GET_ALL_FAVORITES_RESTAURANTS =
  "restaurants/GET_ALL_FAVORITES_RESTAURANTS";
const ADD_FAVORITE = "favorites/ADD_FAVORITE";
const REMOVE_FAVORITE = "favorites/REMOVE_FAVORITE";
const REMOVE_FAVORITE_RESTAURANT = "favorites/REMOVE_FAVORITE_RESTAURANT";

const SET_FAVORITE_ERROR = "favorites/SET_FAVORITE_ERROR";

// ************************************************
//                   ****action creator****
// ************************************************
const actionSetAllFavorites = (allFavorites) => ({
  type: SET_ALL_FAVORITES,
  allFavorites,
});
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

const actionAddFavorite = (favorite) => ({ type: ADD_FAVORITE, favorite });
const actionRemoveFavorite = (favoriteId) => ({
  type: REMOVE_FAVORITE,
  favoriteId,
});
const actionRemoveFavoriteRestaurant = (restaurantId) => ({
  type: REMOVE_FAVORITE_RESTAURANT,
  restaurantId,
});

const actionSetFavoriteError = (errorMessage) => ({
  type: SET_FAVORITE_ERROR,
  payload: errorMessage,
});

// ************************************************
//                   ****Thunks****
// ************************************************
// export const thunkFetchAllFavorites = (userId) => async (dispatch) => {
//   try {
//     if (!userId) {
//       throw new Error("User ID is required to fetch favorites.");
//     }

//     const response = await csrfFetch(`/api/favorites?user_id=${userId}`);
//     if (response.ok) {
//       const allFavorites = await response.json();
//       dispatch(actionSetAllFavorites(allFavorites));
//     } else {
//       const errors = await response.json();
//       dispatch(actionSetFavoriteError(errors.error || "Error fetching all favorites."));
//     }
//   } catch (error) {
//     dispatch(actionSetFavoriteError("An error occurred while fetching all favorites."));
//   }
// };
export const thunkFetchAllFavorites = (userId) => async (dispatch) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch favorites.");
    }

    const response = await csrfFetch(`/api/favorites?user_id=${userId}`);
    if (response.ok) {
      const allFavorites = await response.json();
      dispatch(actionSetAllFavorites(allFavorites));

      // Fetch the detailed data for each favorited restaurant
      const restaurantIds = allFavorites.map((fav) => fav.restaurant_id);
      const restaurantDetails = await Promise.all(
        restaurantIds.map((id) => fetch(`/api/restaurants/${id}`))
      );

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
      console.log("Flat Restaurants Data:", flatRestaurants);
      dispatch(actionGetAllFavoritedRestaurants(flatRestaurants));
    } else {
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

export const thunkToggleFavorite =
  (userId, restaurantId) => async (dispatch) => {
    console.log(
      `Toggling favorite for userId: ${userId}, restaurantId: ${restaurantId}`
    );
    try {
      const response = await csrfFetch("/api/favorites/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, restaurant_id: restaurantId }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.action === "added") {
          console.log("Added favorite:", responseData.favorite);
          dispatch(actionAddFavorite(responseData.favorite));
        } else if (responseData.action === "removed") {
          console.log("Removed favorite:", responseData.favorite.id);
          dispatch(actionRemoveFavorite(responseData.favorite.id));
          dispatch(
            actionRemoveFavoriteRestaurant(responseData.favorite.restaurant_id)
          );
        }
      } else {
        const errors = await response.json();
        console.log("Error response:", errors);
        dispatch(
          actionSetFavoriteError(errors.error || "Error toggling favorite.")
        );
      }
    } catch (error) {
      console.error("Error while toggling favorite:", error);
      dispatch(
        actionSetFavoriteError("An error occurred while toggling favorite.")
      );
    }
  };

// ************************************************
//                   ****Reducer****
// ************************************************
const initialFavoriteState = {
  byId: {},
  allIds: [],
  favoriteRestaurants: {},
  error: null,
};

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
