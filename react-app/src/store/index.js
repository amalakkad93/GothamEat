import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import axios from 'axios';


import versionCheckReducer, { versionCheckComplete } from './versionCheckReducer';
import session from './session';
import mapsReducer from './maps';
import restaurantsReducer from './restaurants';
import favoritesReducer from './favorites';
import menuItemsReducer from './menuItems';
import  ordersReducer from './orders';
import shoppingCartReducer from './shoppingCarts';
import reviewsReducer from './reviews';
import paymentReducer from './payments';
import deliveryReducer from './deliveries';

const rootReducer = combineReducers({
  versionCheck: versionCheckReducer,
  session,
  maps: mapsReducer,
  restaurants: restaurantsReducer,
  favorites: favoritesReducer,
  menuItems: menuItemsReducer,
  orders: ordersReducer,
  shoppingCarts: shoppingCartReducer,
  reviews: reviewsReducer,
  payments: paymentReducer,
  delivery: deliveryReducer,
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
  return new Promise((resolve, reject) => {
    try {
      // Initial configuration for Redux Persist
      const persistConfig = {
        key: 'root',
        storage,
        whitelist: ['shoppingCarts', 'orders', 'delivery', 'payments', 'menuItems', 'restaurants', 'favorites', 'reviews'],
      };

      // Creating a persisted reducer
      const persistedReducer = persistReducer(persistConfig, rootReducer);
      const store = createStore(persistedReducer, preloadedState, enhancer);
      const persistor = persistStore(store);

      // Fetching the version from the backend
      axios.get('/api/version')
        .then(response => {
          const backendVersion = response.data.version;
          const localVersion = store.getState()._persist.version;

          // Version check logic
          if (backendVersion !== localVersion) {
            console.log(`Version mismatch: backend (${backendVersion}) vs local (${localVersion}), purging persistor...`);
            persistor.purge();
          }

          store.dispatch(versionCheckComplete());
          resolve({ store, persistor });
        })
        .catch(error => {
          console.error('Could not fetch version from backend', error);
          store.dispatch(versionCheckComplete());
          // Handle asynchronous errors here
          resolve({ store, persistor });
        });

      if (process.env.NODE_ENV !== 'production') {
        window.store = store;
        window.persistor = persistor;
      }

      resolve({ store, persistor });
    } catch (error) {
      console.error('Error creating the Redux store:', error);
      // Handling synchronous errors during store creation
      reject(error);
    }
  });
};

export default configureStore;


// const configureStore = (preloadedState) => {
//   return new Promise((resolve, reject) => {
//   // Setup the initial config for the store without the version.
//   const persistConfig = {
//     key: 'root',
//     storage,
//     whitelist: ['shoppingCarts', 'orders', 'delivery', 'payments'],
//     // Remove version here because it will be fetched asynchronously
//   };

//   // Create a persisted reducer with the initial configuration.
//   const persistedReducer = persistReducer(persistConfig, rootReducer);
//   const store = createStore(persistedReducer, preloadedState, enhancer);
//   const persistor = persistStore(store);

//   // Fetch the current version from the backend
//   axios.get('/api/version')
//     .then(response => {
//       const backendVersion = response.data.version;
//       const localVersion = store.getState()._persist.version;

//       // If there is a version mismatch, purge the persisted state
//       if (backendVersion !== localVersion) {
//         console.log(`Version mismatch: backend (${backendVersion}) vs local (${localVersion}), purging persistor...`);
//         persistor.purge();
//       }
//       // Regardless of version match, the version check is complete
//       store.dispatch(versionCheckComplete());
//       resolve({ store, persistor });
//     })
//     .catch(error => {
//       console.error('Could not fetch version from backend', error);
//       store.dispatch(versionCheckComplete());
//       resolve({ store, persistor })
//     });

//   // Expose store and persistor to the window (only in non-production environments)
//   if (process.env.NODE_ENV !== 'production') {
//     window.store = store;
//     window.persistor = persistor;
//   }

//   // return { store, persistor };
// });
// };

// export default configureStore;

// import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
// import thunk from 'redux-thunk';
// import { persistStore, persistReducer, createMigrate } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import axios from 'axios';

// // ... Your other reducer imports
// import session from './session';
// import mapsReducer from './maps';
// import restaurantsReducer from './restaurants';
// import favoritesReducer from './favorites';
// import menuItemsReducer from './menuItems';
// import ordersReducer from './orders';
// import shoppingCartReducer from './shoppingCarts';
// import reviewsReducer from './reviews';
// import paymentReducer from './payments';
// import deliveryReducer from './deliveries';

// const rootReducer = combineReducers({
//   session,
//   maps: mapsReducer,
//   restaurants: restaurantsReducer,
//   favorites: favoritesReducer,
//   menuItems: menuItemsReducer,
//   orders: ordersReducer,
//   shoppingCarts: shoppingCartReducer,
//   reviews: reviewsReducer,
//   payments: paymentReducer,
//   delivery: deliveryReducer,
// });

// const migrations = {
//   // Your migrations go here
// };

// const persistConfig = {
//   key: 'root',
//   version: 12, // The version number should match the version in your backend
//   storage,
//   whitelist: ['shoppingCarts', 'orders', 'shipping'],
//   migrate: createMigrate(migrations, { debug: false }), // Set to true if you want to debug migrations
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// let enhancer;

// if (process.env.NODE_ENV === 'production') {
//   enhancer = applyMiddleware(thunk);
// } else {
//   const logger = require('redux-logger').default;
//   const composeEnhancers =
//     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//   enhancer = composeEnhancers(applyMiddleware(thunk, logger));
// }



// const configureStore = (preloadedState) => {
//   const store = createStore(persistedReducer, preloadedState, enhancer);
//   const persistor = persistStore(store);

//   // Expose store and persistor to the window (only in non-production environments)
//   if (process.env.NODE_ENV !== 'production') {
//     window.store = store;
//     window.persistor = persistor; // This line exposes the persistor
//   }

//   // Fetch the current version from the backend
//   const fetchBackendVersion = async () => {
//     try {
//       const response = await axios.get('/api/version');
//       return response.data.version;
//     } catch (error) {
//       console.error('Could not fetch version from backend', error);
//       return null;
//     }
//   };

//   // Check for version mismatch and purge if necessary
//   (async () => {
//     const backendVersion = await fetchBackendVersion();
//     const localVersion = store.getState()._persist.version;
//     if (backendVersion !== null && backendVersion !== localVersion) {
//       console.log('Version mismatch, purging persistor...');
//       await persistor.purge();
//       // After purging, dispatch an action to reinitialize the state or re-fetch data
//       store.dispatch({ type: 'REINITIALIZE_STATE' });
//       // You can also navigate to a certain page if necessary, or reload the app
//     }
//   })();

//   return { store, persistor };
// };

// export default configureStore;


// import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
// import thunk from 'redux-thunk';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import session from './session'
// import mapsReducer from './maps'
// import restaurantsReducer from './restaurants'
// import favoritesReducer from './favorites';
// import menuItemsReducer from './menuItems';
// import ordersReducer from './orders';
// import shoppingCartReducer from './shoppingCarts';
// import reviewsReducer from './reviews'



// const rootReducer = combineReducers({
//   session,
//   maps: mapsReducer,
//   restaurants: restaurantsReducer,
//   favorites: favoritesReducer,
//   menuItems: menuItemsReducer,
//   orders: ordersReducer,
//   shoppingCarts: shoppingCartReducer,
//   reviews: reviewsReducer,

// });

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['shoppingCarts'], // You can choose which reducers you want to persist
// };
// const persistedReducer = persistReducer(persistConfig, rootReducer);


// let enhancer;

// if (process.env.NODE_ENV === 'production') {
//   enhancer = applyMiddleware(thunk);
// } else {
//   const logger = require('redux-logger').default;
//   const composeEnhancers =
//     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//   enhancer = composeEnhancers(applyMiddleware(thunk, logger));
// }

// // const configureStore = (preloadedState) => {
// //   return createStore(rootReducer, preloadedState, enhancer);
// // };
// const configureStore = (preloadedState) => {
//   const store = createStore(persistedReducer, preloadedState, enhancer);
//   const persistor = persistStore(store);
//   return { store, persistor };
// };

// export default configureStore;
