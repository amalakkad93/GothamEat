import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation } from "react-router-dom";
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
import UserProfile from "./components/UserProfile/UserProfile";
import NotFound from "./components/NotFound";

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
      {location.pathname !== "/login" && location.pathname !== "/signup" && (
        <Navigation isLoaded={isLoaded} />
      )}
      {isLoaded && (
        <Routes>
          {/* Basic Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginFormPage />} />
          <Route path="/signup" element={<SignupFormPage />} />
          <Route path="/users/show" element={<UserProfile />} />
          <Route path="/favorites" element={<FavoritesRestaurants />} />
          {/* <Route path="/shopping-cart" element={<ShoppingCart />} /> */}

          {/* Restaurant Routes */}
          <Route path="/restaurants/nearby" element={<GetRestaurants />} />
          <Route
            path="/owner/restaurants"
            element={<GetRestaurants ownerMode={true} />}
          />
          <Route path="/create-restaurant" element={<CreateRestaurantForm />} />
          <Route
            path="/edit-restaurant/:restaurantId"
            element={<EditRestaurantForm />}
          />

          {/* Menu Item Routes */}
          <Route
            path="/restaurant/:restaurantId/create-menu-item"
            element={<CreateMenuItemForm />}
          />
          <Route
            path="/restaurant/:restaurantId/edit-menu-item/:itemId"
            element={<EditMenuItemForm />}
          />
          <Route
            path="/restaurant/:restaurantId/menu-item/:itemId"
            element={<MenuItemOverview />}
          />

          {/* More General Restaurant Route */}
          <Route
            path="/restaurants/:restaurantId"
            element={<RestaurantDetail />}
          />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </>
  );
}

export default App;
