import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from 'redux-persist/integration/react';
import * as sessionActions from "./store/session";

import { ModalProvider, Modal } from "./context/Modal";
import PersistorContext from './context/PersistorContext';
import configureStore from "./store";
import App from "./App";
import Spinner from "./components/Spinner"; // Make sure this is the correct path to your Spinner component

import "./index.css";

const Root = () => {
  // Local state to manage the loading state
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [persistor, setPersistor] = useState(null);

  useEffect(() => {
    configureStore().then(({ store, persistor }) => {
      setStore(store);
      setPersistor(persistor);
      // Simulate a delay if you want to see the loading spinner for testing
      setTimeout(() => setLoading(false), 500); // Remove this line for production

      // Expose store for debugging purposes
      if (process.env.NODE_ENV !== "production") {
        window.store = store;
        window.sessionActions = sessionActions;
      }
    });
  }, []);

  if (loading || !store || !persistor) {
    // Show a spinner while the store is loading
    return <Spinner />;
  }

  return (
    <Provider store={store}>
      <PersistorContext.Provider value={persistor}> 
        <PersistGate loading={<Spinner />} persistor={persistor}>
          <ModalProvider>
            <BrowserRouter>
              <App />
              <Modal />
            </BrowserRouter>
          </ModalProvider>
        </PersistGate>
      </PersistorContext.Provider>
    </Provider>
  );
};

// Render the Root component which wraps the rest of your application
ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById("root")
);



// import React from "react";
// import ReactDOM from "react-dom";
// import { Provider } from "react-redux";
// import { BrowserRouter } from "react-router-dom";
// import { PersistGate } from 'redux-persist/integration/react';

// import { ModalProvider, Modal } from "./context/Modal";
// import configureStore from "./store";
// import * as sessionActions from "./store/session";
// import App from "./App";

// import "./index.css";

// // const store = configureStore();
// const { store, persistor } = configureStore();

// if (process.env.NODE_ENV !== "production") {
// 	window.store = store;
// 	window.sessionActions = sessionActions;
// }

// // Wrap the application with the Modal provider and render the Modal component
// // after the App component so that all the Modal content will be layered as
// // HTML elements on top of the all the other HTML elements:
// // function Root() {
// // 	return (
// // 		<ModalProvider>
// // 			<Provider store={store}>
// // 				<BrowserRouter>
// // 						<App />
// // 					<Modal />
// // 				</BrowserRouter>
// // 			</Provider>
// // 		</ModalProvider>
// // 	);
// // }
// function Root() {
//   return (
//     <ModalProvider>
//       <Provider store={store}>
//         {/* <PersistGate loading={null} persistor={persistor}> */}
//         {/* <PersistGate loading={<div>Loading...</div>} persistor={persistor}> */}
//         <PersistGate persistor={persistor}>
//           <BrowserRouter>
//             <App />
//             <Modal />
//           </BrowserRouter>
//         </PersistGate>
//       </Provider>
//     </ModalProvider>
//   );
// }

// ReactDOM.render(
// 	<React.StrictMode>
// 		<Root />
// 	</React.StrictMode>,
// 	document.getElementById("root")
// );
