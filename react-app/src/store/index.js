import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import session from './session'
import mapsReducer from './maps'
import restaurantsReducer from './restaurants'
import favoritesReducer from './favorites';
import menuItemsReducer from './menuItems';
import ordersReducer from './orders';
import shoppingCartReducer from './shoppingCarts';
import reviewsReducer from './reviews'



const rootReducer = combineReducers({
  session,
  maps: mapsReducer,
  restaurants: restaurantsReducer,
  favorites: favoritesReducer,
  menuItems: menuItemsReducer,
  orders: ordersReducer,
  shoppingCarts: shoppingCartReducer,
  reviews: reviewsReducer,

});


let enhancer;

if (process.env.NODE_ENV === 'production') {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require('redux-logger').default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
