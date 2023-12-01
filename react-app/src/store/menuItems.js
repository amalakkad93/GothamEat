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
// import { fetch } from "./csrf";
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

/** Action type for creating a menu item type in the store */
const CREATE_MENU_ITEM = "menuItems/CREATE_MENU_ITEM";

/** Action type for uploading a menu item image in the store */
const UPLOAD_MENU_ITEM_IMAGE = "menuItems/UPLOAD_MENU_ITEM_IMAGE";

/** Action type for updating a menu item in the store */
const UPDATE_MENU_ITEM = "menuItems/UPDATE_MENU_ITEM";

/** Action type for deleting a menu item in the store */
const DELETE_MENU_ITEM = "DELETE_MENU_ITEM";

/** Action type for deleting a menu item image in the store */
const DELETE_MENU_ITEM_IMAGE = "DELETE_MENU_ITEM_IMAGE";

/** Action type for getting filtered menu items in the store */
const GET_FILTERED_MENU_ITEMS = "menuItems/GET_FILTERED_MENU_ITEMS";

/** Action type for clearing filtered menu items in the store */
const CLEAR_FILTERED_MENU_ITEMS = "menuItems/CLEAR_FILTERED_MENU_ITEMS";

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

/** Creates an action to create a menu item types in the store */
const actionCreateMenuItem = (menuItem) => ({
  type: CREATE_MENU_ITEM,
  menuItem,
});

/** Creates an action to upload a menu item image types in the store */
// const actionUploadMenuItemImage = (menuItemId, imageUrl) => ({
//   type: UPLOAD_MENU_ITEM_IMAGE,
//   menuItemId,
//   imageUrl,
// });
const actionUploadMenuItemImage = (imageId, imagePath, menuItemId) => ({
  type: UPLOAD_MENU_ITEM_IMAGE,
  payload: {
    id: imageId,
    image_path: imagePath,
    menu_item_id: menuItemId,
  },
});

/** Creates an action to update a menu item types in the store */
const actionUpdateMenuItem = (updatedMenuItem) => ({
  type: UPDATE_MENU_ITEM,
  updatedMenuItem,
});

/** Creates an action to delete a menu item types in the store */
export const actionDeleteMenuItem = (menuItemId) => ({
  type: DELETE_MENU_ITEM,
  menuItemId,
});

/** Creates an action to delete a menu item image types in the store */
export const actionDeleteMenuItemImage = (imageId) => ({
  type: DELETE_MENU_ITEM_IMAGE,
  imageId,
});

/** Creates an action to get filtered menu items in the store */
const actionGetFilteredMenuItems = (restaurantId, filteredMenuItems) => ({
  type: GET_FILTERED_MENU_ITEMS,
  restaurantId,
  filteredMenuItems,
});

/** Creates an action to clear filtered menu items in the store */
export const clearFilteredMenuItems = () => ({
  type: CLEAR_FILTERED_MENU_ITEMS,
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

  try {
    const response = await fetch(`/api/menu-items/${itemId}`);
    const data = await response.json();

    if (response.ok) {
      const { byId, allIds } = data;

      const menuItem = byId[allIds[0]];


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

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/menu-items`
      );
      const menuItems = await response.json();

      if (response.ok) {
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

// ***************************************************************
//  Thunk to Create a Menu Item
// ***************************************************************
export const thunkCreateMenuItem = (restaurantId, menuItemData, image) => {


  return async (dispatch) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Submit the menu item
        const menuItemResponse = await fetch(
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
        }

        dispatch(actionCreateMenuItem(menuItemDataResult.entities.MenuItem));

        if (image && menuItemId) {

          // 2. Fetch the presigned URL for menu item image
          const presignedResponse = await fetch(
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
          const { presigned_url } = presignedData;

          // 3. Upload the menu item image directly to S3 using the presigned URL
          await fetch(presigned_url, {
            method: "PUT",
            body: image,
            headers: {
              "Content-Type": image.type,
            },
          });
          // 4. Send the image URL to the backend to store it and get the image record
          const imageResponse = await fetch(
            `/api/menu-items/${menuItemId}/images`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image_url: presignedData.file_url }),
            }
          );

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            dispatch(actionSetMenuItemError(errorData.error));
            return reject(new Error(errorData.error));
          }

          const imageData = await imageResponse.json();

          // dispatch the action with the image data including the ID
          dispatch(
            actionUploadMenuItemImage(
              imageData.id,
              presignedData.file_url,
              menuItemId
            )
          );
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

// ***************************************************************
//  Thunk to Update a Menu Item
// ***************************************************************
export const thunkUpdateMenuItem = (
  menuItemId,
  updatedData,
  newImage,
  existingImageUrl
) => {
  return async (dispatch) => {
    try {
      // Delete existing image
      if (existingImageUrl) {
        const deleteResponse = await fetch("/s3/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: existingImageUrl }),
        });

        if (!deleteResponse.ok) {
          const data = await deleteResponse.json();
          dispatch(actionSetMenuItemError(data.error));
          throw new Error(data.error);
        }
      }

      // Update menu item details
      const menuItemResponse = await fetch(
        `/api/menu-items/${menuItemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (!menuItemResponse.ok) {
        const data = await menuItemResponse.json();
        dispatch(actionSetMenuItemError(data.error));
        throw new Error(data.error);
      }

      const updatedMenuItemData = await menuItemResponse.json();

      // If there's a new image to upload
      if (newImage) {
        // Get presigned URL from the server
        const presignedResponse = await fetch(
          `/s3/generate_presigned_url?filename=${encodeURIComponent(
            newImage.name
          )}&contentType=${encodeURIComponent(newImage.type)}`
        );

        if (!presignedResponse.ok) {
          const data = await presignedResponse.json();
          dispatch(actionSetMenuItemError(data.error));
          throw new Error(data.error);
        }

        const presignedData = await presignedResponse.json();
        const { presigned_url, file_url } = presignedData;

        // Upload the image to S3
        const s3Response = await fetch(presigned_url, {
          method: "PUT",
          body: newImage,
          headers: {
            "Content-Type": newImage.type,
          },
        });

        if (!s3Response.ok) {
          throw new Error("Failed to upload image to S3.");
        }

        // Update the image URL in your application's backend
        const updateImageResponse = await fetch(
          `/api/menu-items/${menuItemId}/images`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_url: file_url }),
          }
        );

        if (!updateImageResponse.ok) {
          const errorData = await updateImageResponse.json();
          dispatch(actionSetMenuItemError(errorData.error));
          throw new Error(errorData.error);
        }

        const updateImageData = await updateImageResponse.json();
        if (updateImageData.status === "success") {
          dispatch(
            actionUploadMenuItemImage(
              updateImageData.id,
              updateImageData.image_url,
              menuItemId
            )
          );
        }
      }

      // Return a success message
      return { message: "Menu item updated successfully" };
    } catch (error) {
      dispatch(
        actionSetMenuItemError(
          error.message ||
            "An unexpected error occurred while updating the menu item."
        )
      );
      throw error;
    }
  };
};

// ***************************************************************
//  Thunk to Delete a Menu Item
// ***************************************************************
export const thunkDeleteMenuItem =
  (menuItemId, imageId) => async (dispatch) => {
    try {
      // Delete the menu item
      if (menuItemId) {
        const menuItemResponse = await fetch(
          `/api/menu-items/${menuItemId}`,
          {
            method: "DELETE",
          }
        );
        if (!menuItemResponse.ok) {
          const data = await menuItemResponse.json();
          dispatch(actionSetMenuItemError(data.error));
          throw new Error(data.error);
        }
        dispatch(actionDeleteMenuItem(menuItemId));
      }

      return { message: "Menu item and its image deleted successfully" };
    } catch (error) {
      dispatch(
        actionSetMenuItemError(
          "An unexpected error occurred while deleting the menu item and its image."
        )
      );
      throw error;
    }
  };

// ***************************************************************
//  Thunk to Filter a Menu Item by Type and/or Price
// ***************************************************************
export const thunkGetFilteredMenuItems =
  (restaurantId, menuItemTypes, minPrice, maxPrice) => async (dispatch) => {
    const queryParams = new URLSearchParams({
      min_price: minPrice,
      max_price: maxPrice,
    })
    menuItemTypes.forEach(type => queryParams.append('type', type));
    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/menu-items/filter?${queryParams}`
      );

      if (response.ok) {
        const filteredMenuItems = await response.json();
        dispatch(actionGetFilteredMenuItems(restaurantId, filteredMenuItems));
      } else {
        // Handle errors
        const error = await response.json();
        dispatch(actionSetMenuItemError(error.message));
      }
    } catch (error) {
      console.error("Error fetching filtered menu items:", error);
      dispatch(actionSetMenuItemError("Failed to fetch filtered menu items."));
    }
  };

// =========================================================
//                   ****Reducer****
// =========================================================
// The reducer calculates the new state based on the previous state and the dispatched action.
// It's a pure function, meaning it doesn't produce side effects and will always return the same output for the same input.

const menuItemInitialState = {
  singleMenuItem: { byId: {}, allIds: [] },
  menuItemsByRestaurant: {},
  // menuItemImages: {},
  menuItemImages: { byId: {}, allIds: [] },
  types: {},
  filteredMenuItems: {},
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
      // Check if the action has defined menuItems before attempting to set them in the state
      if (!action.menuItems) {
        console.error(
          "No menu items provided for restaurant with id:",
          action.restaurantId
        );
        return {
          ...state,
          error: `No menu items provided for restaurant with id: ${action.restaurantId}`,
        };
      }

      // Proceed with updating the state if menuItems are present
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

    case CREATE_MENU_ITEM: {
      const restaurantId = action.menuItem.restaurant_id;
      const updatedMenuItems = state.menuItemsByRestaurant[restaurantId]
        ? [...state.menuItemsByRestaurant[restaurantId], action.menuItem]
        : [action.menuItem];

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
    }

    case UPLOAD_MENU_ITEM_IMAGE: {
      const { id, image_path, menu_item_id, restaurant_id } = action.payload;

      // Initialize the restaurant's menu items if it doesn't exist
      if (!state.menuItemsByRestaurant[restaurant_id]) {
        state.menuItemsByRestaurant[restaurant_id] = [];
      }

      // Initialize the menuItemImages.byId if it doesn't exist
      if (!state.menuItemImages.byId) {
        state.menuItemImages.byId = {};
      }

      // Initialize the menuItemImages.allIds if it doesn't exist
      if (!state.menuItemImages.allIds) {
        state.menuItemImages.allIds = [];
      }

      // Update menuItemImages state
      const newMenuItemImages = {
        ...state.menuItemImages,
        byId: {
          ...state.menuItemImages.byId,
          [id]: { image_path, menu_item_id },
        },
        allIds: [...state.menuItemImages.allIds, id],
      };

      return {
        ...state,
        menuItemImages: newMenuItemImages,
      };
    }

    case UPDATE_MENU_ITEM: {
      if (!action.updatedMenuItem || !action.updatedMenuItem.id) {
        console.error("UPDATE_MENU_ITEM action payload is not as expected.");
        return state;
      }

      const { id } = action.updatedMenuItem;
      let updatedMenuItemsByRestaurant = { ...state.menuItemsByRestaurant };

      if (
        action.updatedMenuItem.restaurant_id &&
        state.menuItemsByRestaurant[action.updatedMenuItem.restaurant_id]
      ) {
        updatedMenuItemsByRestaurant[action.updatedMenuItem.restaurant_id] =
          state.menuItemsByRestaurant[action.updatedMenuItem.restaurant_id].map(
            (item) => (item.id === id ? action.updatedMenuItem : item)
          );
      }

      return {
        ...state,
        singleMenuItem: {
          ...state.singleMenuItem,
          byId: {
            ...state.singleMenuItem.byId,
            [id]: action.updatedMenuItem,
          },
        },
        menuItemsByRestaurant: updatedMenuItemsByRestaurant,
      };
    }

    case DELETE_MENU_ITEM: {
      const newMenuItems = { ...state.menuItems };
      delete newMenuItems[action.menuItemId];
      return {
        ...state,
        menuItems: newMenuItems,
        userHasMenuItem: false,
      };
    }
    case DELETE_MENU_ITEM_IMAGE: {
      const newMenuItemImages = { ...state.menuItemImages };
      delete newMenuItemImages[action.imageId];
      return {
        ...state,
        menuItemImages: newMenuItemImages,
      };
    }
    case GET_FILTERED_MENU_ITEMS:
      return {
        ...state,
        filteredMenuItems: action.filteredMenuItems.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {}),
      };

    case CLEAR_FILTERED_MENU_ITEMS:
      return {
        ...state,
        filteredMenuItems: {},
      };

    case SET_MENU_ITEM_ERROR:
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
