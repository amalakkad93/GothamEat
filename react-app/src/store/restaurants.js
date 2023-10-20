// ************************************************
//                   ****types****
// ************************************************
const GET_NEARBY_RESTAURANTS = "restaurants/GET_NEARBY_RESTAURANTS";
const GET_ALL_RESTAURANTS = "restaurants/GET_ALL_RESTAURANTS";
const GET_SINGLE_RESTAURANT = "restaurants/GET_SINGLE_RESTAURANT";

const SET_RESTAURANT_ERROR = "restaurants/SET_RESTAURANT_ERROR";



// ************************************************
//                   ****action creator****
// ************************************************
const actionGetNearbyRestaurants = (restaurants) => ({type: GET_NEARBY_RESTAURANTS, restaurants})
const actionGetAllRestaurants = (restaurants) => ({type: GET_ALL_RESTAURANTS, restaurants})
const actionGetSingleRestaurant = (restaurant) => ({type: GET_SINGLE_RESTAURANT, restaurant})

const actionSetRestaurantError = (errorMessage) => ({type: SET_RESTAURANT_ERROR, payload: errorMessage,});


// ************************************************
//                   ****Thunks****
// ************************************************

// ******************************thunkGetNearbyRestaurants******************************
export const thunkGetNearbyRestaurants = (latitude, longitude) => async (dispatch) => {
  try {
    const response = await fetch(`/api/restaurants/nearby?latitude=${latitude}&longitude=${longitude}`);

    if(response.ok) {
        const restaurants = await response.json();
        dispatch(actionGetNearbyRestaurants(restaurants));
    } else {
        const errors = await response.json();
        console.error("Error fetching nearby restaurants:", errors);
        dispatch(actionSetRestaurantError(errors.message || "Error fetching nearby restaurants."));
    }
  } catch (error) {
    console.error("An error occurred while fetching nearby restaurants:", error);
    dispatch(actionSetRestaurantError("An error occurred while fetching nearby restaurants."));
  }
};

// ******************************thunkGetAllRestaurants******************************
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

// ******************************thunkGetRestaurantDetails******************************
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


// ************************************************
//                   ****Reducer****
// ************************************************
const initialState = { nearby: [], allRestaurants: {}, singleRestaurant: {}, error: null };

export default function restaurantsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_NEARBY_RESTAURANTS:
      return { ...state, nearby: action.restaurants };
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
