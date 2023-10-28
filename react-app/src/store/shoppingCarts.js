import { csrfFetch } from "./csrf";

// Action Types
const ADD_ITEM_TO_CART = "shoppingCart/ADD_ITEM_TO_CART";
const ADD_TO_CART = "ADD_TO_CART";
const SET_CURRENT_CART = "shoppingCart/SET_CURRENT_CART";
const DELETE_ITEM_FROM_CART = "shoppingCart/DELETE_ITEM_FROM_CART";
const SET_CART_ERROR = "shoppingCart/SET_CART_ERROR";

// Action creators
const actionAddItemToCart = (item) => ({
  type: ADD_ITEM_TO_CART,
  item,
});

const actionSetCurrentCart = (cartItems) => ({
  type: SET_CURRENT_CART,
  cartItems,
});
const actionDeleteItemFromCart = (itemId) => ({
  type: DELETE_ITEM_FROM_CART,
  itemId,
});

export function addToCart(menuItemId, quantity, menuItemName) {
  return {
    type: ADD_TO_CART,
    payload: {
      menuItemId,
      quantity,
      menuItemName,
    },
  };
}

const actionSetCartError = (error) => ({
  type: SET_CART_ERROR,
  error,
});
// Thunk for adding an item to the cart
export const thunkAddItemToCart =
  (menuItemId, quantity) => async (dispatch) => {
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
        dispatch(actionAddItemToCart(data.entities.shoppingCartItems.byId));
        return data.message;
      } else {
        const data = await response.json();
        dispatch(actionSetCartError(data.error));
      }
    } catch (error) {
      dispatch(actionSetCartError("An unexpected error occurred."));
    }
  };

export const thunkFetchCurrentCart = () => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/shopping-carts/current`);

    if (response.ok) {
      const data = await response.json();
      dispatch(actionSetCurrentCart(data.entities.shoppingCartItems.byId));
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
  }
};

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

const initialState = {
  items: {},
  cartItems: {},
  menuItemNames: {},
  error: null,
};

export default function shoppingCartReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_ITEM_TO_CART:
      return {
        ...state,
        items: {
          ...state.items,
          ...action.item,
        },
      };
    case ADD_TO_CART:
      return {
        ...state,
        cartItems: {
          ...state.cartItems,
          [action.payload.menuItemId]: action.payload.quantity,
        },
        menuItemNames: {
          ...state.menuItemNames,
          [action.payload.menuItemId]: action.payload.menuItemName,
        },
      };

    case SET_CURRENT_CART:
      return {
        ...state,
        items: {
          ...state.items,
          ...action.cartItems,
        },
      };
    case DELETE_ITEM_FROM_CART:
      const updatedItems = { ...state.items };
      delete updatedItems[action.itemId];
      return {
        ...state,
        items: updatedItems,
      };

    case SET_CART_ERROR:
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}
