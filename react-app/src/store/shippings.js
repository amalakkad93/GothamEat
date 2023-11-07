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
export const thunkFetchShippings = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/shippings/');
    if (response.ok) {
      const shippings = await response.json();
      dispatch(actionSetShippings(shippings));
    } else {
      throw new Error('Failed to fetch shippings.');
    }
  } catch (error) {
    dispatch(actionSetShippingError(error.message));
  }
};

export const thunkCreateShipping = (newShippingData) => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/shippings/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newShippingData),
    });
    if (response.ok) {
      const shipping = await response.json();
      dispatch(actionAddShipping(shipping));
    } else {
      throw new Error('Failed to create shipping.');
    }
  } catch (error) {
    dispatch(actionSetShippingError(error.message));
  }
};

export const thunkUpdateShipping = (shippingId, updates) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/shippings/${shippingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (response.ok) {
      const shipping = await response.json();
      dispatch(actionUpdateShipping(shippingId, shipping));
    } else {
      throw new Error('Failed to update shipping.');
    }
  } catch (error) {
    dispatch(actionSetShippingError(error.message));
  }
};

export const thunkDeleteShipping = (shippingId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/shippings/${shippingId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      dispatch(actionRemoveShipping(shippingId));
    } else {
      throw new Error('Failed to delete shipping.');
    }
  } catch (error) {
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
