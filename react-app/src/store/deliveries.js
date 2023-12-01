// import { fetch } from './csrf';

// Action Types
const SET_DELIVERIES = 'delivery/SET_DELIVERIES';
const ADD_DELIVERY = 'delivery/ADD_DELIVERY';
const UPDATE_DELIVERY = 'delivery/UPDATE_DELIVERY';
const REMOVE_DELIVERY = 'delivery/REMOVE_DELIVERY';
const SET_DELIVERY_ERROR = 'delivery/SET_DELIVERY_ERROR';

// Action Creators
const actionSetDeliveries = (deliveries) => ({
  type: SET_DELIVERIES,
  deliveries,
});

const actionAddDelivery = (delivery) => ({
  type: ADD_DELIVERY,
  delivery,
});

const actionUpdateDelivery = (deliveryId, updates) => ({
  type: UPDATE_DELIVERY,
  deliveryId,
  updates,
});

const actionRemoveDelivery = (deliveryId) => ({
  type: REMOVE_DELIVERY,
  deliveryId,
});

const actionSetDeliveryError = (error) => ({
  type: SET_DELIVERY_ERROR,
  error,
});

// Thunks
export const thunkGetDeliveries = () => async (dispatch) => {
  try {
    const response = await fetch('/api/delivery');

    // Check if the network response was not ok to throw an error
    if (!response.ok) {
      const errMessage = response.status === 404 ? 'Deliveries not found.' : 'Failed to fetch deliveries.';
      throw new Error(errMessage);
    }

    // Ensure the response is in JSON format
    let deliveries;
    try {
      deliveries = await response.json();

    } catch (e) {
      throw new Error('Invalid JSON response from server.');
    }

    // Dispatch the success action with the deliveries
    dispatch(actionSetDeliveries(deliveries));
  } catch (error) {
    // Handle network errors
    if (!navigator.onLine) {
      error.message = 'No internet connection.';
    }

    // Optionally log the error to the console for debugging
    console.error('Error in thunkGetDeliveries:', error);

    // Dispatch the error action with the error message
    dispatch(actionSetDeliveryError(error.message));
  }
};


export const thunkCreateDelivery = (deliveryData) => async (dispatch) => {
  try {
    const response = await fetch('/api/delivery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deliveryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create delivery.");
    }

    const delivery = await response.json();
    dispatch(actionAddDelivery(delivery));
    return { payload: delivery };
  } catch (error) {
    return { error };
  }
};



export const thunkUpdateDelivery = (deliveryId, updates) => async (dispatch) => {
  try {
    const response = await fetch(`/api/delivery/${deliveryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errMessage = response.status === 404 ? 'Delivery not found.' :
                         response.status === 400 ? 'Invalid update data.' : 'Failed to update delivery.';
      throw new Error(errMessage);
    }

    let delivery;
    try {
      delivery = await response.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server.');
    }

    dispatch(actionUpdateDelivery(deliveryId, delivery));
  } catch (error) {
    if (!navigator.onLine) {
      error.message = 'No internet connection.';
    }

    console.error('Error in thunkUpdateDelivery:', error);
    dispatch(actionSetDeliveryError(error.message));
  }
};

export const thunkDeleteDelivery = (deliveryId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/delivery/${deliveryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errMessage = response.status === 404 ? 'Delivery not found to delete.' : 'Failed to delete delivery.';
      throw new Error(errMessage);
    }

    dispatch(actionRemoveDelivery(deliveryId));
  } catch (error) {
    if (!navigator.onLine) {
      error.message = 'No internet connection.';
    }

    console.error('Error in thunkDeleteDelivery:', error);
    dispatch(actionSetDeliveryError(error.message));
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
const deliveryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DELIVERIES: {
      const allIds = action.deliveries.map((delivery) => delivery.id);
      const byId = action.deliveries.reduce((obj, delivery) => {
        obj[delivery.id] = delivery;
        return obj;
      }, {});
      return { ...state, byId, allIds };
    }
    case ADD_DELIVERY: {
      const { delivery } = action;
      return {
        ...state,
        byId: { ...state.byId, [delivery.id]: delivery },
        allIds: [...state.allIds, delivery.id],
      };
    }
    case UPDATE_DELIVERY: {
      const { deliveryId, updates } = action;
      return {
        ...state,
        byId: { ...state.byId, [deliveryId]: { ...state.byId[deliveryId], ...updates } },
      };
    }
    case REMOVE_DELIVERY: {
      const { deliveryId } = action;
      const newById = { ...state.byId };
      delete newById[deliveryId];
      return {
        ...state,
        byId: newById,
        allIds: state.allIds.filter((id) => id !== deliveryId),
      };
    }
    case SET_DELIVERY_ERROR: {
      return { ...state, error: action.error };
    }
    default:
      return state;
  }
};

export default deliveryReducer;
