/**
 * =========================================================
 *                  MENU ITEMS REDUX MODULE
 * =========================================================
 * This module contains the Redux setup related to handling
 * operations about menu items.
 *
 * Contains:
 * - Action types
 * - Action creators
 * - Thunks (for asynchronous operations)
 * - Reducer (to modify the state based on actions)
 */
import { csrfFetch } from "./csrf";
// =========================================================
//                  ****action types****
// =========================================================
// Action types are constants that define the type property of action objects.
// They help in identifying which action is being dispatched.

/** Action type to handle fetching details of a single menu item */
const GET_SINGLE_MENU_ITEM = "menuItems/GET_SINGLE_MENU_ITEM";

// ** Action type for fetching menu items by restaurant ID **
const GET_MENU_ITEMS_BY_RESTAURANT = "menuItems/GET_MENU_ITEMS_BY_RESTAURANT";

/** Action type for setting menu item images in the store */
const SET_MENU_ITEM_IMAGES = "menuItems/SET_MENU_ITEM_IMAGES";

/** Action type for setting menu item types in the store */
const SET_MENU_ITEM_TYPES = "menuItems/SET_MENU_ITEM_TYPES";

// Action type to handle creating a menu item
const CREATE_MENU_ITEM = "menuItems/CREATE_MENU_ITEM";

// Action type to handle uploading a menu item image
const UPLOAD_MENU_ITEM_IMAGE = "menuItems/UPLOAD_MENU_ITEM_IMAGE";

/** Action type to handle errors related to menu item actions */
const SET_MENU_ITEM_ERROR = "menuItems/SET_MENU_ITEM_ERROR";

// =========================================================
//                  ****action creator****
// =========================================================
// Action creators are factory functions that return an action object.
// These objects are then dispatched to inform the reducer to make changes to the state.

/** Creates an action to set details of a specific menu item in the store */
const actionGetSingleMenuItem = (menuItem) => ({
  type: GET_SINGLE_MENU_ITEM,
  menuItem,
});

// ** Action creator for fetching menu items by restaurant ID **
const actionGetMenuItemsByRestaurant = (restaurantId, menuItems) => ({
  type: GET_MENU_ITEMS_BY_RESTAURANT,
  restaurantId,
  menuItems,
});

/** Creates an action to set menu item images in the store */
const actionSetMenuItemImages = (menuItemImages) => ({
  type: SET_MENU_ITEM_IMAGES,
  menuItemImages,
});

/** Creates an action to set menu item types in the store */
const actionSetMenuItemTypes = (types) => ({
  type: SET_MENU_ITEM_TYPES,
  types,
});

// Action creator for creating a menu item
const actionCreateMenuItem = (menuItem) => ({
  type: CREATE_MENU_ITEM,
  menuItem,
});

// Action creator for uploading a menu item image
const actionUploadMenuItemImage = (menuItemId, imageUrl) => ({
  type: UPLOAD_MENU_ITEM_IMAGE,
  menuItemId,
  imageUrl,
});

/** Creates an action to handle errors during menu item operations */
const actionSetMenuItemError = (errorMessage) => ({
  type: SET_MENU_ITEM_ERROR,
  payload: errorMessage,
});

// =========================================================
//                   ****Thunks****
// =========================================================
// Thunks allow Redux to handle asynchronous operations.
// Instead of returning action objects directly, they return a function that can dispatch multiple actions.

// ***************************************************************
//  Thunk to Fetch Details of a Specific Menu Item
// ***************************************************************
export const thunkGetMenuItemDetails = (itemId) => async (dispatch) => {
  console.log(`Fetching details for menu item with ID ${itemId}`);
  try {
    const response = await fetch(`/api/menu-items/${itemId}`);
    const data = await response.json();
    console.log("Server response:", data);
    if (response.ok) {
      const { byId, allIds } = data;

      const menuItem = byId[allIds[0]];
      console.log("Extracted Menu Item:", menuItem);

      dispatch(actionGetSingleMenuItem(menuItem));
    } else {
      const errors = await response.json();
      console.error(
        `Error fetching details for menu item with ID ${itemId}:`,
        errors
      );
      dispatch(
        actionSetMenuItemError(
          errors.error ||
            `Error fetching details for menu item with ID ${itemId}.`
        )
      );
    }
  } catch (error) {
    console.error(
      `An error occurred while fetching details for menu item with ID ${itemId}:`,
      error
    );
    dispatch(
      actionSetMenuItemError(
        `An error occurred while fetching details for menu item with ID ${itemId}.`
      )
    );
  }
};

// ***************************************************************
//  Thunk to Fetch Menu Items by Restaurant ID
// ***************************************************************
/**
 * Fetches menu items for a specific restaurant by its unique ID.
 * Dispatches actions based on the result of the fetch operation.
 */
export const thunkGetMenuItemsByRestaurantId =
  (restaurantId) => async (dispatch) => {
    console.log(`Fetching menu items for restaurant with ID ${restaurantId}`);
    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/menu-items`
      );
      const menuItems = await response.json();
      // console.log("Server Response:", menuItems);
      if (response.ok) {
        console.log(
          `Menu items for restaurant ID ${restaurantId}:`,
          menuItems.entities.menuItems
        );
        dispatch(
          actionGetMenuItemsByRestaurant(
            restaurantId,
            menuItems.entities.menuItems
          )
        );

        // Dispatch actions for setting menu item images and types
        dispatch(actionSetMenuItemImages(menuItems.entities.menuItemImages));
        dispatch(actionSetMenuItemTypes(menuItems.entities.types));
      } else {
        dispatch(
          actionSetMenuItemError(
            menuItems.error ||
              `Error fetching menu items for restaurant ID ${restaurantId}.`
          )
        );
      }
    } catch (error) {
      console.error(
        `An error occurred while fetching menu items for restaurant ID ${restaurantId}:`,
        error
      );
      dispatch(
        actionSetMenuItemError(
          `An error occurred while fetching menu items for restaurant ID ${restaurantId}.`
        )
      );
    }
  };

  export const thunkCreateMenuItem = (restaurantId, menuItemData, image) => {
    console.log('Received image in thunk:', image);

    return async (dispatch) => {
      return new Promise(async (resolve, reject) => {
        try {
          // 1. Submit the menu item
          const menuItemResponse = await csrfFetch(
            `/api/restaurants/${restaurantId}/menu-items`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(menuItemData),
            }
          );

          if (!menuItemResponse.ok) {
            const data = await menuItemResponse.json();
            dispatch(actionSetMenuItemError(data.error));
            return reject(new Error(data.error));
          }

          const menuItemDataResult = await menuItemResponse.json();

          let menuItemId;
          if (
            menuItemDataResult.entities.MenuItem.allIds &&
            menuItemDataResult.entities.MenuItem.allIds.length > 0
          ) {
            menuItemId = menuItemDataResult.entities.MenuItem.allIds[0];
            console.log("Extracted Menu item ID:", menuItemId);
          }

          console.log("Image:", image);
          console.log("Menu item data result:", menuItemDataResult);
          console.log("Menu item ID:", menuItemDataResult.entities && menuItemDataResult.entities.MenuItem ? menuItemDataResult.entities.MenuItem.id : undefined);

          dispatch(actionCreateMenuItem(menuItemDataResult.entities.MenuItem));

          if (image && menuItemId) {
            console.log("Image object:", image);
            console.log("Image name:", image.name);
            console.log("Image type:", image.type);

            // 2. Fetch the presigned URL for menu item image
            const presignedResponse = await csrfFetch(
              `/s3/generate_presigned_url?filename=${image.name}&contentType=${image.type}`
            );

            if (
              !presignedResponse.headers
                .get("content-type")
                .includes("application/json")
            ) {
              throw new Error(
                "Server didn't respond with JSON. Check the server's response."
              );
            }

            const presignedData = await presignedResponse.json();
            console.log("Presigned data:", presignedData);

            const { presigned_url } = presignedData;

            // 3. Upload the menu item image directly to S3 using the presigned URL
            await fetch(presigned_url, {
              method: "PUT",
              body: image,
              headers: {
                "Content-Type": image.type,
              },
            });

            // 4. Send the image URL to the backend to store it
            await csrfFetch(
              `/api/menu-items/${menuItemId}/images`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_url: presignedData.file_url }),
              }
            );
            console.log(
              "About to dispatch image:",
              menuItemDataResult.menuItemId,
              presignedData.file_url
            );
            dispatch(
              actionUploadMenuItemImage(
                menuItemId,
                presignedData.file_url
              )
            );

            console.log("Menu item image action dispatched");
          }

          resolve({
            message: menuItemDataResult.message,
            menuItemId: menuItemDataResult.menuItemId,
          });
        } catch (error) {
          dispatch(
            actionSetMenuItemError(
              error.message ||
                "An unexpected error occurred while creating the menu item."
            )
          );
          reject(error);
        }
      });
    };
  };


// =========================================================
//                   ****Reducer****
// =========================================================
// The reducer calculates the new state based on the previous state and the dispatched action.
// It's a pure function, meaning it doesn't produce side effects and will always return the same output for the same input.

const menuItemInitialState = {
  singleMenuItem: { byId: {}, allIds: [] },
  menuItemsByRestaurant: {},
  menuItemImages: {},
  // menuItemImages: {},
  types: {},
  error: null,
  isLoading: false,
};

/** Defines how the state should change for each menu item action */
export default function menuItemsReducer(state = menuItemInitialState, action) {
  switch (action.type) {
    case GET_SINGLE_MENU_ITEM:
      return {
        ...state,
        singleMenuItem: {
          byId: { [action.menuItem.id]: action.menuItem },
          allIds: [action.menuItem.id],
        },
      };

    case GET_MENU_ITEMS_BY_RESTAURANT:
      return {
        ...state,
        menuItemsByRestaurant: {
          ...state.menuItemsByRestaurant,
          [action.restaurantId]: action.menuItems,
        },
      };
    case SET_MENU_ITEM_IMAGES:
      return {
        ...state,
        menuItemImages: action.menuItemImages,
      };

    case SET_MENU_ITEM_TYPES:
      return {
        ...state,
        types: action.types,
      };

    case CREATE_MENU_ITEM:
      const restaurantId = action.menuItem.restaurant_id; // Assuming this is how you get the restaurant ID
      const updatedMenuItems = state.menuItemsByRestaurant[restaurantId]
        ? [...state.menuItemsByRestaurant[restaurantId], action.menuItem.id]
        : [action.menuItem.id];

      return {
        ...state,
        singleMenuItem: {
          byId: {
            ...state.singleMenuItem.byId,
            [action.menuItem.id]: action.menuItem,
          },
          allIds: [...state.singleMenuItem.allIds, action.menuItem.id],
        },
        menuItemsByRestaurant: {
          ...state.menuItemsByRestaurant,
          [restaurantId]: updatedMenuItems,
        },
      };
      case UPLOAD_MENU_ITEM_IMAGE: {
        return {
            ...state,
            menuItemImages: {
                ...state.menuItemImages,
                [action.menuItemId]: action.imageUrl
            }
        };
    }


    // case UPLOAD_MENU_ITEM_IMAGE: {
    //   console.log("++++++++Payload received:", action);

    //   const newMenuItemImages = {
    //     ...state.menuItemImages,
    //     [action.menuItemId]: action.imageUrl,
    //   };
    //   return {
    //     ...state,
    //     menuItemImages: newMenuItemImages,
    //   };
    // }

    case SET_MENU_ITEM_ERROR:
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
