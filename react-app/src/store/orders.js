import { csrfFetch } from './csrf';
// Action type to handle adding an order
const ADD_ORDER = "orders/ADD_ORDER";

/** Creates an action to set the created order in the store */
const actionAddOrder = (order) => ({
  type: ADD_ORDER,
  order,
});
// Thunk to create an order
export const thunkCreateOrder = (userId, total_price, cartItems) => async (dispatch) => {
  try {
    const response = await csrfFetch("/api/orders/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        total_price,
        items: cartItems
      })
    });

    const data = await response.json();

    if (response.ok) {
      dispatch(actionAddOrder(data));
      return null;
    } else {
      return data.errors;
    }
  } catch (error) {
    console.error("An error occurred while creating the order:", error);
    return ["An error occurred while creating the order."];
  }
};
// Updated initialState with orders key
const menuItemInitialState = {
  // ... other keys
  orders: [],
};

export default function ordersReducer(state = menuItemInitialState, action) {
  switch (action.type) {
    // ... other cases

    case ADD_ORDER:
      return {
        ...state,
        orders: [...state.orders, action.order],
      };

    default:
      return state;
  }
}
