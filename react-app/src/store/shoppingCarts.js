import { csrfFetch } from "./csrf";

// Action Types
const ADD_ITEM_TO_CART = "shoppingCart/ADD_ITEM_TO_CART";
const ADD_TO_CART = "ADD_TO_CART";
const ADD_MORE_ITEMS_TO_CART = "shoppingCart/ADD_MORE_ITEMS_TO_CART";
const SET_CURRENT_CART = "shoppingCart/SET_CURRENT_CART";
const SET_TOTAL_PRICE = 'SET_TOTAL_PRICE';
const DELETE_ITEM_FROM_CART = "shoppingCart/DELETE_ITEM_FROM_CART";
const UPDATE_ITEM_IN_CART = "shoppingCart/UPDATE_ITEM_IN_CART";
const CLEAR_CART = "shoppingCart/CLEAR_CART";

const SET_CART_LOADING = "SET_CART_LOADING";
const SET_CART_NOT_LOADING = "SET_CART_NOT_LOADING";
const SET_CART_ERROR = "shoppingCart/SET_CART_ERROR";

// Action creators
const actionAddItemToCart = (itemId, quantity, restaurantId) => ({
  type: ADD_ITEM_TO_CART,
  payload: { itemId, quantity, restaurantId },
});

// Action creator for adding more items
export const actionAddMoreItemsToCart = (items) => ({
  type: ADD_MORE_ITEMS_TO_CART,
  payload: items,
});

const actionSetCurrentCart = (cartItems) => ({
  type: SET_CURRENT_CART,
  cartItems,
});

const actionSetTotalPrice = (totalPrice) => ({
  type: SET_TOTAL_PRICE,
  payload: totalPrice,
});

const actionDeleteItemFromCart = (itemId) => ({
  type: DELETE_ITEM_FROM_CART,
  itemId,
});

export function addToCart(menuItemId, quantity, menuItemData) {
  return {
    type: ADD_TO_CART,
    payload: {
      menuItemId,
      quantity,
      menuItemData,
    },
  };
}
const actionUpdateItemInCart = (itemId, quantity, totalPrice) => ({
  type: UPDATE_ITEM_IN_CART,
  itemId,
  quantity,
  totalPrice,
});

const actionClearCart = () => ({
  type: CLEAR_CART,
});
export const setCartLoading = () => ({ type: SET_CART_LOADING });
export const setCartNotLoading = () => ({ type: SET_CART_NOT_LOADING });
const actionSetCartError = (error) => ({
  type: SET_CART_ERROR,
  error,
});

// ***************************************************************
//  Thunk to Add an item to the cart
// ***************************************************************
export const thunkAddItemToCart =
  (menuItemId, quantity, restaurantId) => async (dispatch) => {
    try {
      const response = await csrfFetch(
        `/api/shopping-carts/${menuItemId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ menu_item_id: menuItemId, quantity }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("+++-Thunk API response data From thunkAddItemToCart:", data);
        const itemId = Object.keys(data.entities.shoppingCartItems.byId)[0];
        console.log("+++-Dispatching actionAddItemToCart with itemId From thunkAddItemToCart:", itemId);
        dispatch(actionAddItemToCart(itemId, quantity, restaurantId));
        dispatch(thunkFetchCurrentCart());
        return data.message;
      } else {
        const data = await response.json();
        dispatch(actionSetCartError(data.error));
      }
    } catch (error) {
      dispatch(actionSetCartError("An unexpected error occurred."));
    }
  };

export const thunkAddItemsToCart =
  (items, restaurantId) => async (dispatch) => {
    try {
      const response = await csrfFetch(`/api/shopping-carts/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(items), // items is an array of { menu_item_id, quantity }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          "+Added items to shopping cart: ",
          data.entities.shoppingCartItems.byId
        );
        // Dispatch actions for each added item
        Object.values(data.entities.shoppingCartItems.byId).forEach((item) => {
          dispatch(actionAddItemToCart(item.id, item.quantity, restaurantId));
        });
        return data.message;
      } else {
        const data = await response.json();
        dispatch(actionSetCartError(data.error));
      }
    } catch (error) {
      dispatch(actionSetCartError("An unexpected error occurred."));
    }
  };

// ***************************************************************
//  Thunk to fetch the current cart
// ***************************************************************
// ***************************************************************
//  Thunk to fetch the current cart
// ***************************************************************
export const thunkFetchCurrentCart = () => async (dispatch) => {
  dispatch(setCartLoading());
  try {
    const response = await csrfFetch(`/api/shopping-carts/current`);

    if (response.ok) {
      const data = await response.json();
      dispatch(actionSetCurrentCart(data.entities.shoppingCartItems.byId));
      // Assuming the total price comes in the response under data.metadata.totalPrice
      dispatch(actionSetTotalPrice(data.metadata.totalPrice));
    } else {
      const data = await response.json();
      dispatch(actionSetCartError(data.error));
    }
  } catch (error) {
    dispatch(
      actionSetCartError(
        "An unexpected error occurred while fetching the cart."
      )
    );
  } finally {
    dispatch(setCartNotLoading());
  }
};


// ***************************************************************
//  Thunk to delete an item from the cart
// ***************************************************************
export const thunkDeleteItemFromCart = (itemId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/shopping-carts/items/${itemId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(actionDeleteItemFromCart(itemId));
      return data.message;
    } else {
      const data = await response.json();
      dispatch(actionSetCartError(data.error));
    }
  } catch (error) {
    dispatch(
      actionSetCartError(
        "An unexpected error occurred while deleting the cart item."
      )
    );
  }
};

// ***************************************************************
//  Thunk to update an item in the cart
// ***************************************************************
export const thunkUpdateItemInCart = (itemId, quantity) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/shopping-carts/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(actionUpdateItemInCart(itemId, quantity, data.totalPrice));
     
      return data.message;
    } else {
      const data = await response.json();
      dispatch(actionSetCartError(data.error));
    }
  } catch (error) {
    dispatch(
      actionSetCartError(
        "An unexpected error occurred while updating the cart item."
      )
    );
  }
};

// ***************************************************************
//  Thunk to clear the cart
// ***************************************************************
export const thunkClearCart = () => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/shopping-carts/current/clear`, {
      method: "DELETE",
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(actionClearCart());
      return data.message;
    } else {
      const data = await response.json();
      dispatch(actionSetCartError(data.error));
    }
  } catch (error) {
    dispatch(
      actionSetCartError(
        "An unexpected error occurred while clearing the cart."
      )
    );
  }
};

const initialState = {
  items: { byId: {}, allIds: [] },
  cartItems: { byId: {}, allIds: [] },
  menuItemsInfo: { byId: {}, allIds: [] },
  totalPrice: 0,
  restaurantId: null,
  isLoading: false,
  error: null,
};

export default function shoppingCartReducer(state = initialState, action) {
  console.log("State before handling action:", state);
  console.log("Action being handled in shoppingCart:", action);

  switch (action.type) {
    case ADD_ITEM_TO_CART: {
      console.log("==Handling ADD_ITEM_TO_CART action", action.payload);

      const { itemId, quantity, restaurantId } = action.payload;
      const numericQuantity = Number(action.payload.quantity);
      console.log(`**Current restaurantId in state: ${state.restaurantId}`);
      console.log(`**New restaurantId from action: ${restaurantId}`);

      // If there's no item in the cart, set the restaurantId, otherwise keep the existing one
      const newRestaurantId =
        state.items.allIds.length === 0 ? restaurantId : state.restaurantId;

      console.log(`**New restaurantId to be set in state: ${newRestaurantId}`);

      const newState = {
        ...state,
        restaurantId: newRestaurantId,
        items: {
          byId: {
            ...state.items.byId,
            [itemId]: {
              ...(state.items.byId[itemId] || {}),
              quantity:
                (state.items.byId[itemId]?.quantity || 0) + numericQuantity,
            },
          },
          allIds: state.items.allIds.includes(itemId)
            ? state.items.allIds
            : [...state.items.allIds, itemId],
        },
      };
      console.log("+++-New cart state:", newState);
      return newState;
    }
    case ADD_MORE_ITEMS_TO_CART: {
      const { items } = action.payload; // 'items' would be an array of item objects
      const updatedItemsById = { ...state.items.byId };
      const updatedAllIds = [...state.items.allIds];

      items.forEach((item) => {
        if (updatedAllIds.includes(item.id)) {
          // If the item already exists, increment the quantity
          updatedItemsById[item.id].quantity += item.quantity;
        } else {
          // If the item is new, add it to the cart
          updatedItemsById[item.id] = item;
          updatedAllIds.push(item.id);
        }
      });

      return {
        ...state,
        items: {
          byId: updatedItemsById,
          allIds: updatedAllIds,
        },
      };
    }

    case ADD_TO_CART: {
      const { menuItemId, quantity, menuItemData } = action.payload;
      return {
        ...state,
        cartItems: {
          byId: {
            ...state.cartItems.byId,
            [menuItemId]: (state.cartItems.byId[menuItemId] || 0) + quantity,
          },
          allIds: state.cartItems.allIds.includes(menuItemId)
            ? state.cartItems.allIds
            : [...state.cartItems.allIds, menuItemId],
        },
        menuItemsInfo: {
          byId: {
            ...state.menuItemsInfo.byId,
            [menuItemId]: menuItemData,
          },
          allIds: state.menuItemsInfo.allIds.includes(menuItemId)
            ? state.menuItemsInfo.allIds
            : [...state.menuItemsInfo.allIds, menuItemId],
        },
      };
    }

    case SET_CART_LOADING: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case SET_CART_NOT_LOADING: {
      return {
        ...state,
        isLoading: false,
      };
    }
    // case SET_CURRENT_CART: {
    //   const allIds = Object.keys(action.cartItems);
    //   return {
    //     ...state,
    //     items: {
    //       byId: {
    //         ...state.items.byId,
    //         ...action.cartItems,
    //       },
    //       allIds: allIds,
    //     },
    //   };
    // }
    case SET_CURRENT_CART: {
      const newCartItemsById = action.cartItems;
      const newAllIds = Object.keys(newCartItemsById);

      return {
        ...state,
        cartItems: {
          byId: newCartItemsById,
          allIds: newAllIds,
        },
      };
    }

    case DELETE_ITEM_FROM_CART: {
      const newById = { ...state.items.byId };
      delete newById[action.itemId];
      return {
        ...state,
        items: {
          byId: newById,
          allIds: state.items.allIds.filter((id) => id !== action.itemId),
        },
      };
    }
    case UPDATE_ITEM_IN_CART: {
      return {
        ...state,
        items: {
          byId: {
            ...state.items.byId,
            [action.itemId]: {
              ...state.items.byId[action.itemId],
              quantity: action.quantity,
            },
          },
          allIds: state.items.allIds, // unchanged
        },
        totalPrice: action.totalPrice,
      };
    }
    case CLEAR_CART: {
      return {
        ...state,
        items: { byId: {}, allIds: [] },
        cartItems: { byId: {}, allIds: [] },
        menuItemData: { byId: {}, allIds: [] },
        totalPrice: 0,
      };
      // return {
      //   ...initialState, // Reset to initialState which will also reset the restaurantId
      // };
    }
    case SET_TOTAL_PRICE: {
      return {
        ...state,
        totalPrice: action.payload,
      };
    }
    case SET_CART_ERROR: {
      return {
        ...state,
        error: action.error,
      };
    }
    default:
      return state;
  }
}
