import { csrfFetch } from './csrf';

// Action Types
const SET_SHIPPINGS = 'shipping/SET_SHIPPINGS';
const ADD_SHIPPING = 'shipping/ADD_SHIPPING';
const UPDATE_SHIPPING = 'shipping/UPDATE_SHIPPING';
const REMOVE_SHIPPING = 'shipping/REMOVE_SHIPPING';
const SET_SHIPPING_ERROR = 'shipping/SET_SHIPPING_ERROR';

// Action Creators
const actionSetShippings = (shippings) => ({
  type: SET_SHIPPINGS,
  shippings,
});

const actionAddShipping = (shipping) => ({
  type: ADD_SHIPPING,
  shipping,
});

const actionUpdateShipping = (shippingId, updates) => ({
  type: UPDATE_SHIPPING,
  shippingId,
  updates,
});

const actionRemoveShipping = (shippingId) => ({
  type: REMOVE_SHIPPING,
  shippingId,
});

const actionSetShippingError = (error) => ({
  type: SET_SHIPPING_ERROR,
  error,
});

// Thunks
export const thunkGetShippings = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/shipping');

    // Check if the network response was not ok to throw an error
    if (!response.ok) {
      const errMessage = response.status === 404 ? 'Shippings not found.' : 'Failed to fetch shippings.';
      throw new Error(errMessage);
    }

    // Ensure the response is in JSON format
    let shippings;
    try {
      shippings = await response.json();

    } catch (e) {
      throw new Error('Invalid JSON response from server.');
    }

    console.log("~~~~~thunkGetShippings ~ shippings:", shippings)
    // Dispatch the success action with the shippings
    dispatch(actionSetShippings(shippings));
  } catch (error) {
    // Handle network errors
    if (!navigator.onLine) {
      error.message = 'No internet connection.';
    }

    // Optionally log the error to the console for debugging
    console.error('Error in thunkGetShippings:', error);

    // Dispatch the error action with the error message
    dispatch(actionSetShippingError(error.message));
  }
};


export const thunkCreateShipping = (newShippingData) => async (dispatch) => {
  console.log("~~~~~thunkCreateShipping ~ newShippingData:", newShippingData)
  try {
    const response = await csrfFetch('/api/shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newShippingData),
    });

    if (!response.ok) {
      const errMessage = response.status === 400 ? 'Invalid shipping data.' : 'Failed to create shipping.';
      throw new Error(errMessage);
    }

    let shipping;
    try {
      shipping = await response.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server.');
    }

    console.log("~~~~~thunkCreateShipping ~ shipping:", shipping)
    dispatch(actionAddShipping(shipping));
  } catch (error) {
    if (!navigator.onLine) {
      error.message = 'No internet connection.';
    }

    console.error('Error in thunkCreateShipping:', error);
    dispatch(actionSetShippingError(error.message));
  }
};


export const thunkUpdateShipping = (shippingId, updates) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/shipping/${shippingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errMessage = response.status === 404 ? 'Shipping not found.' :
                         response.status === 400 ? 'Invalid update data.' : 'Failed to update shipping.';
      throw new Error(errMessage);
    }

    let shipping;
    try {
      shipping = await response.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server.');
    }

    dispatch(actionUpdateShipping(shippingId, shipping));
  } catch (error) {
    if (!navigator.onLine) {
      error.message = 'No internet connection.';
    }

    console.error('Error in thunkUpdateShipping:', error);
    dispatch(actionSetShippingError(error.message));
  }
};

export const thunkDeleteShipping = (shippingId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/shipping/${shippingId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errMessage = response.status === 404 ? 'Shipping not found to delete.' : 'Failed to delete shipping.';
      throw new Error(errMessage);
    }

    // No need to parse JSON for a DELETE request, assuming no content in response
    dispatch(actionRemoveShipping(shippingId));
  } catch (error) {
    if (!navigator.onLine) {
      error.message = 'No internet connection.';
    }

    console.error('Error in thunkDeleteShipping:', error);
    dispatch(actionSetShippingError(error.message));
  }
};



// Initial State
const initialState = {
  byId: {},
  allIds: [],
  isLoading: false,
  error: null,
};

// Reducer
const shippingReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SHIPPINGS: {
      const allIds = action.shippings.map((shipping) => shipping.id);
      const byId = action.shippings.reduce((obj, shipping) => {
        obj[shipping.id] = shipping;
        return obj;
      }, {});
      return { ...state, byId, allIds };
    }
    case ADD_SHIPPING: {
      const { shipping } = action;
      return {
        ...state,
        byId: { ...state.byId, [shipping.id]: shipping },
        allIds: [...state.allIds, shipping.id],
      };
    }
    case UPDATE_SHIPPING: {
      const { shippingId, updates } = action;
      return {
        ...state,
        byId: { ...state.byId, [shippingId]: { ...state.byId[shippingId], ...updates } },
      };
    }
    case REMOVE_SHIPPING: {
      const { shippingId } = action;
      const newById = { ...state.byId };
      delete newById[shippingId];
      return {
        ...state,
        byId: newById,
        allIds: state.allIds.filter((id) => id !== shippingId),
      };
    }
    case SET_SHIPPING_ERROR: {
      return { ...state, error: action.error };
    }
    default:
      return state;
  }
};

export default shippingReducer;
