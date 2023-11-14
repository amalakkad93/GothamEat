import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

import { authenticate } from "./store/session";
import Navigation from "./components/Navigation";
import Home from "./components/Home";
import SignupFormPage from "./components/SignupFormPage";
import LoginFormPage from "./components/LoginFormPage";
import GetRestaurants from "./components/Restaurants/GetRestaurants";
import RestaurantDetail from "./components/Restaurants/RestaurantDetail";
import FavoritesRestaurants from "./components/Restaurants/FavoritesRestaurants";
import CreateRestaurantForm from "./components/Restaurants/RestaurantForms/CreateRestaurantForm";
import EditRestaurantForm from "./components/Restaurants/RestaurantForms/EditRestaurantForm";
import MenuItemOverview from "./components/MenuItems/GetMenuItems/MenuItemOverview";
import CreateMenuItemForm from "./components/MenuItems/MenuItemForm/CreateMenuItemForm";
import EditMenuItemForm from "./components/MenuItems/MenuItemForm/EditMenuItemForm";
import ShoppingCart from "./components/ShoppingCarts/GetShoppingCarts";
import UserOrderLists from "./components/Orders/UserOrderLists";
import OrderDetailPage from "./components/Orders/OrderDetailPage";
import OrderConfirmationPage from "./components/Orders/OrderConfirmationPage";
import PaymentPage from "./components/Payments/PaymentPage";
import CheckoutPage from "./components/Orders/CheckoutPage";
import UserProfile from "./components/UserProfile/UserProfile";
import NotFound from "./components/NotFound";

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const sessionUser = useSelector((state) => state.session.user);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(authenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {location.pathname !== "/login" && location.pathname !== "/signup" && (
        <Navigation isLoaded={isLoaded} />
      )}
      {isLoaded && (
       <Routes>
       {/* Static routes */}
       <Route path="/" element={<Home />} />
       <Route path="/login" element={<LoginFormPage />} />
       <Route path="/signup" element={<SignupFormPage />} />
       <Route path="/checkout" element={<CheckoutPage />} />

       <Route path="/users/show" element={<UserProfile />} />
       <Route path="/favorites" element={<FavoritesRestaurants />} />
       <Route path="/shopping-cart" element={<ShoppingCart />} />
       {/* <Route path="/checkout" element={<CheckoutComponent />} /> */}
       {/* <Route path="/payment" element={<PaymentComponent />} /> */}
       <Route path="/create-restaurant" element={<CreateRestaurantForm />} />

       {/* Dynamic routes with parameters should be lower */}
       <Route path="/restaurants/nearby" element={<GetRestaurants />} />
       <Route path="/owner/restaurants" element={<GetRestaurants ownerMode={true} />} />
       <Route path="/restaurants/:restaurantId" element={<RestaurantDetail />} />

       <Route path="/edit-restaurant/:restaurantId" element={<EditRestaurantForm />} />
       <Route path="/restaurant/:restaurantId/create-menu-item" element={<CreateMenuItemForm />} />
       <Route path="/restaurant/:restaurantId/edit-menu-item/:itemId" element={<EditMenuItemForm />} />
       <Route path="/restaurant/:restaurantId/menu-item/:itemId" element={<MenuItemOverview />} />

       {/* Orders should be ordered such that the specific orderId route is before the general orders route */}

       <Route path="/orders/:orderId" element={<OrderDetailPage />} />
       {/* <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} /> */}
       <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
       <Route path="/payment/:orderId" element={<PaymentPage />} />
       <Route path="/orders" element={<UserOrderLists />} />

       {/* Catch-all route for undefined paths */}
       <Route path="*" element={<NotFound />} />
     </Routes>

      )}
    </>
  );
}

export default App;
