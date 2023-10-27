/**
 * =========================================================
 *                  RESTAURANTS REDUX MODULE
 * =========================================================
 * This module contains the Redux setup related to handling
 * operations about restaurants.
 *
 * Contains:
 * - Action types
 * - Action creators
 * - Thunks (for asynchronous operations)
 * - Reducer (to modify the state based on actions)
 */

// =========================================================
//                  ****action types****
// =========================================================
// Action types are constants that define the type property of action objects.
// They help in identifying which action is being dispatched.

/** Action type to handle fetching nearby restaurants */
const GET_NEARBY_RESTAURANTS = "restaurants/GET_NEARBY_RESTAURANTS";

/** Action type to handle fetching all restaurants */
const GET_ALL_RESTAURANTS = "restaurants/GET_ALL_RESTAURANTS";

/** Action type to handle fetching details of a single restaurant */
const GET_SINGLE_RESTAURANT = "restaurants/GET_SINGLE_RESTAURANT";

/** Action type to handle errors related to restaurant actions */
const SET_RESTAURANT_ERROR = "restaurants/SET_RESTAURANT_ERROR";

// =========================================================
//                  ****action creator****
// =========================================================
// Action creators are factory functions that return an action object.
// These objects are then dispatched to inform the reducer to make changes to the state.

/** Creates an action to set nearby restaurants in the store */
const actionGetNearbyRestaurants = (restaurants) => ({ type: GET_NEARBY_RESTAURANTS, restaurants });

/** Creates an action to set all available restaurants in the store */
const actionGetAllRestaurants = (restaurants) => ({ type: GET_ALL_RESTAURANTS, restaurants });

/** Creates an action to set details of a specific restaurant in the store */
const actionGetSingleRestaurant = (restaurant) => ({ type: GET_SINGLE_RESTAURANT, restaurant });

/** Creates an action to handle errors during restaurant operations */
const actionSetRestaurantError = (errorMessage) => ({ type: SET_RESTAURANT_ERROR, payload: errorMessage });

// =========================================================
//                   ****Thunks****
// =========================================================
// Thunks allow Redux to handle asynchronous operations.
// Instead of returning action objects directly, they return a function that can dispatch multiple actions.

// ***************************************************************
//  Thunk to Fetch Nearby Restaurants
// ***************************************************************
/**
 * Fetches nearby restaurants based on either geographical coordinates or city details.
 * Dispatches actions based on the result of the fetch operation.
 */
export const thunkGetNearbyRestaurants = (latitude, longitude, city, state, country) => async (dispatch) => {
  console.log("Inside thunk with:", latitude, longitude, city, state, country);
  let url = `/api/restaurants/nearby`;

  if (latitude && longitude) {
      url += `?latitude=${latitude}&longitude=${longitude}`;
  } else if (city) {
      url += `?city=${city}&state=${state}&country=${country}`;
  } else {
      dispatch(actionSetRestaurantError("Either coordinates or city name must be provided."));
      return;
  }

  try {
      const response = await fetch(url);
      if(response.ok) {
          const restaurants = await response.json();
          dispatch(actionGetNearbyRestaurants(restaurants));
      } else {
          const errors = await response.json();
          dispatch(actionSetRestaurantError(errors.error || "Error fetching nearby restaurants."));
      }
  } catch (error) {
      dispatch(actionSetRestaurantError("An error occurred while fetching nearby restaurants."));
  }
};

// ***************************************************************
//  Thunk to Fetch All Restaurants
// ***************************************************************
/** Fetches all restaurants and dispatches actions based on the result */
export const thunkGetAllRestaurants = () => async (dispatch) => {
  try {
    const response = await fetch(`/api/restaurants`);

    if(response.ok) {
        const restaurants = await response.json();
        dispatch(actionGetAllRestaurants(restaurants));
    } else {
        const errors = await response.json();
        console.error("Error fetching all restaurants:", errors);
        dispatch(actionSetRestaurantError(errors.message || "Error fetching all restaurants."));
    }
  } catch (error) {
    console.error("An error occurred while fetching all restaurants:", error);
    dispatch(actionSetRestaurantError("An error occurred while fetching all restaurants."));
  }
};

// ***************************************************************
//  Thunk to Fetch Details of a Specific Restaurant
// ***************************************************************
/**
 * Fetches details for a specific restaurant by its unique ID.
 * Dispatches actions based on the result.
 */
export const thunkGetRestaurantDetails = (restaurantId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}`);

    if(response.ok) {
        const restaurant = await response.json();
        dispatch(actionGetSingleRestaurant(restaurant));
    } else {
        const errors = await response.json();
        console.error(`Error fetching details for restaurant with ID ${restaurantId}:`, errors);
        dispatch(actionSetRestaurantError(errors.message || `Error fetching details for restaurant with ID ${restaurantId}.`));
    }
  } catch (error) {
    console.error(`An error occurred while fetching details for restaurant with ID ${restaurantId}:`, error);
    dispatch(actionSetRestaurantError(`An error occurred while fetching details for restaurant with ID ${restaurantId}.`));
  }
};

// =========================================================
//                   ****Reducer****
// =========================================================
// The reducer calculates the new state based on the previous state and the dispatched action.
// It's a pure function, meaning it doesn't produce side effects and will always return the same output for the same input.

const initialState = {
  nearby: { byId: {}, allIds: [] },
  allRestaurants: { byId: {}, allIds: [] },
  singleRestaurant: { byId: {}, allIds: [] },
  error: null
};

/** Defines how the state should change for each action */
export default function restaurantsReducer(state = initialState, action) {
  let newState;
  switch (action.type) {
    case GET_NEARBY_RESTAURANTS:
      // return { ...state, nearby: action.restaurants };
      newState = { ...state, nearby: [] };
      newState.nearby = action.restaurants;
      return newState;

    case GET_ALL_RESTAURANTS:
      return { ...state, allRestaurants: action.restaurants };

    case GET_SINGLE_RESTAURANT:
      return { ...state, singleRestaurant: action.restaurant };

    case SET_RESTAURANT_ERROR:
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
