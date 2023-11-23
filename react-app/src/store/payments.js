import { csrfFetch } from "./csrf";

const SET_PAYMENTS = 'payments/SET_PAYMENTS';
const ADD_PAYMENT = 'payments/ADD_PAYMENT';
const UPDATE_PAYMENT = 'payments/UPDATE_PAYMENT';
const DELETE_PAYMENT = 'payments/DELETE_PAYMENT';
const PAYMENT_ERROR = 'payments/PAYMENT_ERROR';

const actionSetPayments = (payments) => ({
  type: SET_PAYMENTS,
  payload: payments,
});

const actionAddPayment = (payment) => ({
  type: ADD_PAYMENT,
  payload: payment,
});

const actionUpdatePayment = (payment) => ({
  type: UPDATE_PAYMENT,
  payload: payment,
});

const actionDeletePayment = (paymentId) => ({
  type: DELETE_PAYMENT,
  payload: paymentId,
});

const actionPaymentError = (error) => ({
  type: PAYMENT_ERROR,
  payload: error,
});


export const thunkGetPayments = () => async (dispatch) => {
  try {
    const response = await fetch('/api/payments');

    if (response.ok) {
      const payments = await response.json();
      dispatch(actionSetPayments(payments));
    } else {
      throw new Error('Failed to fetch payments.');
    }
  } catch (error) {
    dispatch(actionPaymentError(error.message));
  }
};

export const thunkCreatePayment = (paymentData) => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create payment.");
    }

    const paymentResponse = await response.json();

    // Dispatch the payment data contained within the 'data' key
    dispatch(actionAddPayment(paymentResponse.data));
    return { payload: paymentResponse.data };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { error };
  }
};

export const thunkEditPayment = (paymentId, paymentData) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (response.ok) {
      const payment = await response.json();
      dispatch(actionUpdatePayment(payment));
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update payment.');
    }
  } catch (error) {
    dispatch(actionPaymentError(error.message));
  }
};

export const thunkRemovePayment = (paymentId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/payments/${paymentId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      dispatch(actionDeletePayment(paymentId));
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete payment.');
    }
  } catch (error) {
    dispatch(actionPaymentError(error.message));
  }
};

const initialState = {
  byId: {},  // Store payments by their ID
  allIds: [],  // Keep track of all payment IDs
  error: null,
};

const paymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PAYMENT:
      const paymentId = action.payload.id;
      return {
        ...state,
        byId: {
          ...state.byId,
          [paymentId]: action.payload,
        },
        allIds: [...state.allIds, paymentId],
      };
    case UPDATE_PAYMENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...action.payload,
          },
        },
      };
    case DELETE_PAYMENT:
      const newState = { ...state.byId };
      delete newState[action.payload];
      return {
        ...state,
        byId: newState,
        allIds: state.allIds.filter(id => id !== action.payload),
      };
    case PAYMENT_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default paymentReducer;
