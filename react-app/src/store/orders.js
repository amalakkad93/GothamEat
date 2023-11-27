// import { fetch } from "./csrf";
import { produce } from "immer";

import { actionClearCart } from "./shoppingCarts";
import {
  addEntity,
  mergeEntities,
  removeEntity,
} from "../assets/helpers/entityHelpers";
// Action types
export const ADD_ORDER = "orders/ADD_ORDER";
export const SET_CREATED_ORDER = "orders/SET_CREATED_ORDER";
export const SET_ORDERS = "orders/SET_ORDERS";
export const REMOVE_ORDER = "orders/REMOVE_ORDER";
export const UPDATE_ORDER = "orders/UPDATE_ORDER";
export const SET_USER_ORDERS = "orders/SET_USER_ORDERS";
export const SET_ORDER_DETAILS = "orders/SET_ORDER_DETAILS";
export const REORDER_PAST_ORDER = "orders/REORDER_PAST_ORDER";
export const SET_ORDER_ITEMS = "orders/SET_ORDER_ITEMS";
export const CANCEL_ORDER = "orders/CANCEL_ORDER";
export const SET_LOADING = "orders/SET_LOADING";
export const SET_ERROR = "orders/SET_ERROR";

// Action creators
export const actionAddOrder = (order) => ({
  type: ADD_ORDER,
  payload: { order },
});

// Action creator
export const actionSetCreatedOrder = (order, items) => ({
  type: SET_CREATED_ORDER,
  payload: { order, items },
});

export const actionSetOrders = (orders) => ({
  type: SET_ORDERS,
  payload: { orders },
});

export const actionRemoveOrder = (orderId) => ({
  type: REMOVE_ORDER,
  payload: { orderId },
});

export const actionUpdateOrder = (orderId, status) => ({
  type: UPDATE_ORDER,
  payload: { orderId, status },
});

export const actionSetUserOrders = (orders) => ({
  type: SET_USER_ORDERS,
  payload: { orders },
});

export const actionSetOrderDetails = (orderDetails) => ({
  type: SET_ORDER_DETAILS,
  payload: orderDetails,
});

export const actionReorderPastOrder = (order) => ({
  type: REORDER_PAST_ORDER,
  payload: { order },
});

export const actionSetOrderItems = (orderItems) => ({
  type: SET_ORDER_ITEMS,
  payload: { orderItems },
});

export const actionCancelOrder = (orderId) => ({
  type: CANCEL_ORDER,
  payload: { orderId },
});

export const setLoading = (loading) => ({
  type: "SET_LOADING",
  payload: loading,
});

export const setError = (error) => ({
  type: "SET_ERROR",
  payload: error,
});

// Thunk to create an order
export const thunkCreateOrder =
  (userId, total_price, cartItems) => async (dispatch) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          total_price,
          items: cartItems,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(actionAddOrder(data));
        dispatch(actionClearCart());
        // Optionally, return the created order data.
        return data;
      } else {
        console.error("Error creating the order:", data.errors);
        return data.errors;
      }
    } catch (error) {
      console.error("An error occurred while creating the order:", error);
      return ["An error occurred while creating the order."];
    }
  };

export const thunkCreateOrderFromCart =
  (orderData) => async (dispatch, getState) => {
    try {
      const state = getState();
      const cartItemsById = state.shoppingCarts.cartItems.byId;
      const menuItemsDetailsById = state.shoppingCarts.menuItemsInfo.byId;

      // Prepare detailed order items
      const detailedItems = Object.values(cartItemsById).map((cartItem) => ({
        menu_item_id: cartItem.menu_item_id,
        quantity: cartItem.quantity,
        name: menuItemsDetailsById[cartItem.menu_item_id]?.name,
        price: menuItemsDetailsById[cartItem.menu_item_id]?.price,
      }));

      const requestData = {
        user_id: orderData.user_id,
        delivery_id: orderData.delivery_id,
        payment_id: orderData.payment_id,
        items: detailedItems,
      };

      // Make the API call to create an order
      const response = await fetch("/api/orders/create_order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Process the response
      if (response.ok) {
        const order = await response.json();
        // Include detailed items in the order object for the Redux action
        const orderWithDetails = {
          ...order,
          items: detailedItems,
        };
        dispatch(actionSetCreatedOrder(orderWithDetails, detailedItems));
        return { ok: true, payload: orderWithDetails };
      } else {
        const errors = await response.json();
        console.error("Error response from create_order:", errors);
        return { ok: false, error: errors.error };
      }
    } catch (error) {
      console.error("An error occurred while creating the order:", error);
      return { ok: false, error: error.message };
    }
  };

// Thunk to delete an order
export const thunkDeleteOrder = (orderId, userId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      dispatch(actionRemoveOrder(orderId));
      dispatch(thunkGetUserOrders(userId));
    } else {
      const errors = await response.json();
      console.error(`Error deleting order ID ${orderId}:`, errors);
      // Handle your error dispatching here, if needed
    }
  } catch (error) {
    console.error(
      `An error occurred while deleting order ID ${orderId}:`,
      error
    );
  }
};

// Thunk to update an order's status
export const thunkUpdateOrderStatus = (orderId, status) => async (dispatch) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      dispatch(actionUpdateOrder(orderId, status));
    } else {
      const errors = await response.json();
      console.error(`Error updating status for order ID ${orderId}:`, errors);
    }
  } catch (error) {
    console.error(
      `An error occurred while updating status for order ID ${orderId}:`,
      error
    );
  }
};

// Thunk to get user's orders
export const thunkGetUserOrders = (userId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/orders/user/${userId}`);
    if (response.ok) {
      const orders = await response.json();
      dispatch(actionSetUserOrders(orders));
      return orders;
    } else {
      const errors = await response.json();
      console.error(`Error fetching orders for user ID ${userId}:`, errors);
      // Handle your error dispatching here, if needed
    }
  } catch (error) {
    console.error(
      `An error occurred while fetching orders for user ID ${userId}:`,
      error
    );
  }
};

// Thunk to reorder a past order
export const thunkReorderPastOrder = (orderId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/reorder`, {
      method: "POST",
    });
    if (response.ok) {
      const order = await response.json();
      dispatch(actionReorderPastOrder(order));
      return order;
    } else {
      const errors = await response.json();
      console.error(`Error reordering order ID ${orderId}:`, errors);
    }
  } catch (error) {
    console.error(
      `An error occurred while reordering order ID ${orderId}:`,
      error
    );
  }
};

// Thunk to get order items
export const thunkGetOrderItems = (orderId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/items`);
    if (response.ok) {
      const orderItems = await response.json();
      dispatch(actionSetOrderItems(orderItems));
      return orderItems;
    } else {
      const errors = await response.json();
      console.error(`Error fetching items for order ID ${orderId}:`, errors);
    }
  } catch (error) {
    console.error(
      `An error occurred while fetching items for order ID ${orderId}:`,
      error
    );
  }
};

// Thunk to cancel an order
export const thunkCancelOrder = (orderId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
    });
    if (response.ok) {
      dispatch(actionCancelOrder(orderId));
    } else {
      const errors = await response.json();
      console.error(`Error cancelling order ID ${orderId}:`, errors);
    }
  } catch (error) {
    console.error(
      `An error occurred while cancelling order ID ${orderId}:`,
      error
    );
  }
};

export const thunkGetOrderDetails = (orderId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await fetch(`/api/orders/${orderId}`);

    if (response.ok) {
      const orderDetails = await response.json();
      dispatch(actionSetOrderDetails(orderDetails));
    } else {
      const errors = await response.json();
      dispatch(setError(errors));
    }
  } catch (error) {
    dispatch(setError(error.toString()));
  } finally {
    dispatch(setLoading(false));
  }
};

// Initial state
const initialState = {
  orders: { byId: {}, allIds: [] },
  orderItems: { byId: {}, allIds: [] },
  menuItems: { byId: {}, allIds: [] },
  createdOrder: null, // for tracking the most recently created order
  isLoading: false,
  error: null,
};

export default function ordersReducer(state = initialState, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case ADD_ORDER:
        addEntity(draft.orders, action.order);
        break;

      case SET_ORDERS:
        mergeEntities(draft.orders, action.payload.orders);
        break;

      case SET_CREATED_ORDER:
        if (action.payload && Array.isArray(action.payload.items)) {
          // Update the createdOrder in the state
          draft.createdOrder = action.payload.order;

          // Iterate through items and update orderItems and menuItems
          action.payload.items.forEach((item) => {
            if (item && item.menu_item_id) {
              draft.orderItems.byId[item.menu_item_id] = {
                id: item.menu_item_id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              };

              // Add item to menuItems if not already present
              if (!draft.menuItems.byId[item.menu_item_id]) {
                draft.menuItems.byId[item.menu_item_id] = {
                  id: item.menu_item_id,
                  name: item.name,
                  price: item.price,
                };
              }
            }
          });
        } else {
          console.error(
            "SET_CREATED_ORDER: 'items' not found or not an array in action payload"
          );
        }
        break;

      case REMOVE_ORDER:
        removeEntity(draft.orders, action.payload.orderId);
        break;

      case UPDATE_ORDER:
        if (draft.orders.byId[action.orderId]) {
          draft.orders.byId[action.orderId].status = action.status;
        }
        break;

      case SET_USER_ORDERS:
        mergeEntities(draft.orders, action.payload.orders);
        break;

      case SET_ORDER_DETAILS:
        console.log(
          "--order: Setting order details in Redux state:",
          action.payload
        );
        const { order, orderItems, menuItems } = action.payload;
        draft.orders.byId[order.id] = order;
        draft.orderItems.byId = {
          ...draft.orderItems.byId,
          ...orderItems.byId,
        };
        draft.menuItems.byId = { ...draft.menuItems.byId, ...menuItems.byId };
        break;

      case REORDER_PAST_ORDER:
        addEntity(draft.orders, action.order);
        break;

      case SET_ORDER_ITEMS:
        mergeEntities(draft.orderItems, action.payload.orderItems);
        break;

      case CANCEL_ORDER:
        if (draft.orders.byId[action.orderId]) {
          draft.orders.byId[action.orderId].status = "Cancelled";
        }
        break;

      case SET_LOADING:
        draft.isLoading = action.payload;
        break;

      case SET_ERROR:
        draft.error = action.payload;
        break;

      default:
        return state;
    }
  });
}
