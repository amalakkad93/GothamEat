import { csrfFetch } from './csrf';
// ************************************************
//                   ****types****
// ************************************************
const ADD_FAVORITE = "favorites/ADD_FAVORITE";
const REMOVE_FAVORITE = "favorites/REMOVE_FAVORITE";
const SET_FAVORITE_ERROR = "favorites/SET_FAVORITE_ERROR";

// ************************************************
//                   ****action creator****
// ************************************************
const actionAddFavorite = (favorite) => ({ type: ADD_FAVORITE, favorite });
const actionRemoveFavorite = (favoriteId) => ({ type: REMOVE_FAVORITE, favoriteId });
const actionSetFavoriteError = (errorMessage) => ({ type: SET_FAVORITE_ERROR, payload: errorMessage });

// ************************************************
//                   ****Thunks****
// ************************************************
// ************************************************
//                   ****Thunks****
// ************************************************
export const thunkAddFavorite = (userId, restaurantId) => async (dispatch) => {
  try {
    // Check if the favorite already exists
    const existingFavoriteResponse = await csrfFetch(`/api/favorites/check?user_id=${userId}&restaurant_id=${restaurantId}`);
    const existingFavoriteData = await existingFavoriteResponse.json();

    if (existingFavoriteData.exists) {
      // Handle the case where the favorite already exists (e.g., show a message to the user)
      dispatch(actionSetFavoriteError("Favorite already exists for this user and restaurant."));
    } else {
      // If the favorite does not exist, proceed with insertion
      const response = await csrfFetch('/api/favorites/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, restaurant_id: restaurantId })
      });

      if (response.ok) {
        const favorite = await response.json();
        dispatch(actionAddFavorite(favorite));
      } else {
        const errors = await response.json();
        dispatch(actionSetFavoriteError(errors.error || "Error adding favorite."));
      }
    }
  } catch (error) {
    dispatch(actionSetFavoriteError("An error occurred while adding favorite."));
  }
};


export const thunkRemoveFavorite = (favoriteId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/favorites/${favoriteId}`, { method: 'DELETE' });

    if (response.ok) {
      dispatch(actionRemoveFavorite(favoriteId));
    } else {
      const errors = await response.json();
      dispatch(actionSetFavoriteError(errors.error || "Error removing favorite."));
    }
  } catch (error) {
    dispatch(actionSetFavoriteError("An error occurred while removing favorite."));
  }
};

// ************************************************
//                   ****Reducer****
// ************************************************
const initialFavoriteState = {
  byId: {},
  allIds: [],
  error: null
};

export default function favoritesReducer(state = initialFavoriteState, action) {
  switch (action.type) {
    case ADD_FAVORITE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.favorite.id]: action.favorite
        },
        allIds: [...state.allIds, action.favorite.id]
      };
    case REMOVE_FAVORITE:
      const newById = { ...state.byId };
      delete newById[action.favoriteId];
      return {
        ...state,
        byId: newById,
        allIds: state.allIds.filter(id => id !== action.favoriteId)
      };
    case SET_FAVORITE_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}
