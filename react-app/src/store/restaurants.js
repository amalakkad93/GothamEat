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
import { csrfFetch } from "./csrf";
import {removeEntityFromSection} from '../assets/helpers/helpers'
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

/** Action type to handle fetching restaurants owned by a user */
const GET_OWNER_RESTAURANTS = "restaurants/GET_OWNER_RESTAURANTS";

/** Action type to handle creating a new restaurant */
const CREATE_RESTAURANT = "restaurants/CREATE_RESTAURANT";

/** Action type to handle updating a restaurant */
const UPDATE_RESTAURANT = "restaurants/UPDATE_RESTAURANT";

/** Action type to handle deleting a restaurant */
const DELETE_RESTAURANT = "restaurants/DELETE_RESTAURANT";

/** Action type to handle errors related to restaurant actions */
const SET_RESTAURANT_ERROR = "restaurants/SET_RESTAURANT_ERROR";

// =========================================================
//                  ****action creator****
// =========================================================
// Action creators are factory functions that return an action object.
// These objects are then dispatched to inform the reducer to make changes to the state.

/** Creates an action to set nearby restaurants in the store */
const actionGetNearbyRestaurants = (restaurants) => ({
  type: GET_NEARBY_RESTAURANTS,
  restaurants,
});

/** Creates an action to set all available restaurants in the store */
const actionGetAllRestaurants = (restaurants) => ({
  type: GET_ALL_RESTAURANTS,
  restaurants,
});

/** Creates an action to set details of a specific restaurant in the store */
const actionGetSingleRestaurant = (restaurant) => ({
  type: GET_SINGLE_RESTAURANT,
  restaurant,
});

/** Creates an action to set restaurants owned by a user in the store */
const actionGetOwnerRestaurants = (restaurants) => ({
  type: GET_OWNER_RESTAURANTS,
  restaurants,
});

/** Creates an action to handle creating a new restaurant */
const actionCreateRestaurant = (restaurant) => ({
  type: CREATE_RESTAURANT,
  restaurant,
});

/** Creates an action to handle updating a restaurant */
const actionUpdateRestaurant = (restaurant) => ({
  type: UPDATE_RESTAURANT,
  restaurant,
});

/** Creates an action to handle deleting a restaurant */
const actionDeleteRestaurant = (restaurantId) => ({
  type: DELETE_RESTAURANT,
  restaurantId,
});


/** Creates an action to handle errors during restaurant operations */
const actionSetRestaurantError = (errorMessage) => ({
  type: SET_RESTAURANT_ERROR,
  payload: errorMessage,
});

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
export const thunkGetNearbyRestaurants =
  (latitude, longitude, city, state, country) => async (dispatch) => {

    let url = `/api/restaurants/nearby`;

    if (latitude && longitude) {
      url += `?latitude=${latitude}&longitude=${longitude}`;
    } else if (city) {
      url += `?city=${city}&state=${state}&country=${country}`;
    } else {
      dispatch(
        actionSetRestaurantError(
          "Either coordinates or city name must be provided."
        )
      );
      return;
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        const restaurants = await response.json();
        dispatch(actionGetNearbyRestaurants(restaurants));
      } else {
        const errors = await response.json();
        dispatch(
          actionSetRestaurantError(
            errors.error || "Error fetching nearby restaurants."
          )
        );
      }
    } catch (error) {
      dispatch(
        actionSetRestaurantError(
          "An error occurred while fetching nearby restaurants."
        )
      );
    }
  };

// ***************************************************************
//  Thunk to Fetch All Restaurants
// ***************************************************************
/** Fetches all restaurants and dispatches actions based on the result */
export const thunkGetAllRestaurants = () => async (dispatch) => {
  try {
    const response = await fetch(`/api/restaurants`);

    if (response.ok) {
      const restaurants = await response.json();
      dispatch(actionGetAllRestaurants(restaurants));
    } else {
      const errors = await response.json();
      console.error("Error fetching all restaurants:", errors);
      dispatch(
        actionSetRestaurantError(
          errors.message || "Error fetching all restaurants."
        )
      );
    }
  } catch (error) {
    console.error("An error occurred while fetching all restaurants:", error);
    dispatch(
      actionSetRestaurantError(
        "An error occurred while fetching all restaurants."
      )
    );
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

    if (response.ok) {
      const restaurant = await response.json();
      dispatch(actionGetSingleRestaurant(restaurant));

      // Return the fetched restaurant details.
      return restaurant;

    } else {
      const errors = await response.json();
      console.error(
        `Error fetching details for restaurant with ID ${restaurantId}:`,
        errors
      );
      dispatch(
        actionSetRestaurantError(
          errors.message ||
            `Error fetching details for restaurant with ID ${restaurantId}.`
        )
      );
    }
  } catch (error) {
    console.error(
      `An error occurred while fetching details for restaurant with ID ${restaurantId}:`,
      error
    );
    dispatch(
      actionSetRestaurantError(
        `An error occurred while fetching details for restaurant with ID ${restaurantId}.`
      )
    );
  }
};

// ***************************************************************
//  Thunk to Fetch Restaurants Owned by a User
// ***************************************************************
/** Fetches restaurants owned by a user and dispatches actions based on the result */
export const thunkGetOwnerRestaurants = () => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/restaurants/owned`);

    if (response.ok) {
      const restaurants = await response.json();
      // console.log("Fetched owner's restaurants:", restaurants);

      // dispatch(actionGetOwnerRestaurants(restaurants.Restaurants));
      dispatch(actionGetOwnerRestaurants(restaurants));

    } else {
      const errors = await response.json();
      dispatch(
        actionSetRestaurantError(
          errors.error || "Error fetching owner's restaurants."
        )
      );
    }
  } catch (error) {
    dispatch(
      actionSetRestaurantError(
        "An error occurred while fetching owner's restaurants."
      )
    );
  }
};

// ***************************************************************
//  Thunk to Create a New Restaurant
// ***************************************************************
/** Creates a new restaurant and dispatches actions based on the result */
export const thunkCreateRestaurant = (restaurantData) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/restaurants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurantData),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(actionCreateRestaurant(data.entities.restaurants));
      return { type: "SUCCESS", data };
    } else {
      const errors = await response.json();
      dispatch(
        actionSetRestaurantError(errors.error || "Error creating restaurant.")
      );
      throw errors;
    }
  } catch (error) {
    // console.log("Entered catch block", error);
    dispatch(
      actionSetRestaurantError(
        "An error occurred while creating the restaurant."
      )
    );
    throw error;
  }
};

// ***************************************************************
//  Thunk to Update a Restaurant
// ***************************************************************
/** Updates a restaurant and dispatches actions based on the result */
export const thunkUpdateRestaurant = (updatedData) => async (dispatch) => {
    try {
      const response = await csrfFetch(`/api/restaurants/${updatedData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(actionUpdateRestaurant(data.entities.restaurants));
        return { type: "SUCCESS", data };
      } else {
        const errors = await response.json();
        dispatch(
          actionSetRestaurantError(
            errors.error || `Error updating restaurant with ID ${updatedData.id}.`
          )
        );
        throw errors;
      }
    } catch (error) {
      dispatch(
        actionSetRestaurantError(
          `An error occurred while updating restaurant with ID ${updatedData.id}.`
        )
      );
      throw error;
    }
  };

// ***************************************************************
//  Thunk to Delete a Restaurant
// ***************************************************************
/** Deletes a restaurant and dispatches actions based on the result */
export const thunkDeleteRestaurant = (restaurantId) => async (dispatch) => {
  try {
      const response = await csrfFetch(`/api/restaurants/${restaurantId}`, {
          method: "DELETE",
      });

      if (response.ok) {
          const data = await response.json();

          // Dispatch the action to update the Redux state after a successful deletion
          dispatch(actionDeleteRestaurant(restaurantId));

          return { type: "SUCCESS" };
      } else {
          const errors = await response.json();
          dispatch(
              actionSetRestaurantError(errors.error || "Error deleting restaurant.")
          );
          throw errors;
      }
  } catch (error) {
      dispatch(
          actionSetRestaurantError(
              `An error occurred while deleting the restaurant with ID ${restaurantId}.`
          )
      );
      throw error;
  }
};


// =========================================================
//                   ****Reducer****
// =========================================================
// The reducer calculates the new state based on the previous state and the dispatched action.
// It's a pure function, meaning it doesn't produce side effects and will always return the same output for the same input.

const initialState = {
  nearby: { byId: {}, allIds: [] },
  owner: { byId: {}, allIds: [] },
  allRestaurants: { byId: {}, allIds: [] },
  singleRestaurant: { byId: {}, allIds: [] },
  error: null,
};

/** Defines how the state should change for each action */
export default function restaurantsReducer(state = initialState, action) {
  let newState;
  switch (action.type) {
    case GET_NEARBY_RESTAURANTS:
      newState = { ...state, nearby: [] };
      newState.nearby = action.restaurants;
      return newState;

    case GET_ALL_RESTAURANTS:
      return { ...state, allRestaurants: action.restaurants };

    case GET_SINGLE_RESTAURANT:
      // console.log("Processing GET_SINGLE_RESTAURANT:", action.restaurant);
      return {
          ...state,
          singleRestaurant: { ...state.singleRestaurant, ...action.restaurant.entities.restaurants }
      };

      // case GET_OWNER_RESTAURANTS:
      //   newState = { ...state, owner: [] };
      //   newState.owner = action.restaurants;
      //   return newState;
      case GET_OWNER_RESTAURANTS:
        newState = { ...state, owner: [] };
        newState.owner = action.restaurants;
        return newState;


    case CREATE_RESTAURANT:
      return {
        ...state,
        allRestaurants: {
          byId: {
            ...state.allRestaurants.byId,
            ...action.restaurant.byId,
          },
          allIds: [...state.allRestaurants.allIds, ...action.restaurant.allIds],
        },
      };

    case UPDATE_RESTAURANT:
      return {
        ...state,
        singleRestaurant: {
          ...state.singleRestaurant,
          ...action.restaurant,
        },
      };


      case DELETE_RESTAURANT: {
        // console.log("DELETE_RESTAURANT action received. Current state:", state);
        // console.log("Restaurant ID to delete:", action.restaurantId);

        const newState = { ...state };

        // Logging and handling for allRestaurants slice
        // console.log("allRestaurants.byId before deletion:", newState.allRestaurants.byId);
        // console.log("allRestaurants.allIds before deletion:", newState.allRestaurants.allIds);

        delete newState.allRestaurants.byId[action.restaurantId];

        if (newState.allRestaurants.allIds && Array.isArray(newState.allRestaurants.allIds)) {
            newState.allRestaurants.allIds = newState.allRestaurants.allIds.filter(
                (id) => id !== action.restaurantId
            );
        } else {
            console.error("allRestaurants.allIds is not an array or is undefined!");
            newState.allRestaurants.allIds = [];
        }

        // Logging and handling for owner slice
        // console.log("owner.byId before deletion:", newState.owner.byId);
        // console.log("owner.allIds before deletion:", newState.owner.allIds);

        if (newState.owner.byId) {
            delete newState.owner.byId[action.restaurantId];
        }

        if (newState.owner.allIds && Array.isArray(newState.owner.allIds)) {
            newState.owner.allIds = newState.owner.allIds.filter(
                (id) => id !== action.restaurantId
            );
        } else {
            console.error("owner.allIds is not an array or is undefined!");
            newState.owner.allIds = [];
        }

        // console.log("State after deletion:", newState);

        return newState;
    }










      // case DELETE_RESTAURANT:
      //   const { restaurantId } = action;

      //   return {
      //       ...state,
      //       nearby: removeEntityFromSection(state.nearby, restaurantId),
      //       owner: removeEntityFromSection(state.owner, restaurantId),
      //       allRestaurants: removeEntityFromSection(state.allRestaurants, restaurantId),
      //       singleRestaurant: removeEntityFromSection(state.singleRestaurant, restaurantId),
      //   };

    case SET_RESTAURANT_ERROR:
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
