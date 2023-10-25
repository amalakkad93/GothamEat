// // FavoritesContext.js
// import React, { createContext, useContext, useReducer } from "react";

// // Initial state
// const initialState = {
//   favoritesById: {},
// };

// // Create context
// const FavoritesContext = createContext();

// export const useFavorites = () => {
//   return useContext(FavoritesContext);
// };

// const favoritesReducer = (state, action) => {
//   switch (action.type) {
//     case "ADD_FAVORITE":
//       return {
//         ...state,
//         favoritesById: {
//           ...state.favoritesById,
//           [action.favorite.id]: action.favorite
//         },
//       };
//     case "REMOVE_FAVORITE":
//       const newState = { ...state };
//       delete newState.favoritesById[action.favoriteId];
//       return newState;
//     default:
//       return state;
//   }
// };

// export const FavoritesProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(favoritesReducer, initialState);

//   // Define actions
//   const toggleFavorite = (favorite) => {
//     if (state.favoritesById[favorite.id]) {
//       dispatch({ type: "REMOVE_FAVORITE", favoriteId: favorite.id });
//     } else {
//       dispatch({ type: "ADD_FAVORITE", favorite });
//     }
//   };

//   const isFavorited = (favoriteId) => {
//     return Boolean(state.favoritesById[favoriteId]);
//   };

//   const contextValue = {
//     ...state,
//     toggleFavorite,
//     isFavorited,
//   };

//   return (
//     <FavoritesContext.Provider value={contextValue}>
//       {children}
//     </FavoritesContext.Provider>
//   );
// };
