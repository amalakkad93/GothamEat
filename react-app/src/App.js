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

import image1 from "./assets/image1.png";
import image2 from "./assets/image2.jpg";
import image3 from "./assets/image3.jpg";
import image4 from "./assets/image4.jpg";
import image5 from "./assets/image5.jpg";
import image6 from "./assets/image6.jpg";
import image7 from "./assets/image7.jpg";
import image8 from "./assets/image8.jpg";
import image9 from "./assets/image9.jpg";
import image10 from "./assets/image10.jpg";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const sessionUser = useSelector((state) => state.session.user);

  const [isLoaded, setIsLoaded] = useState(false);
  const [bgImageIndex, setBgImageIndex] = useState(0);

  const images = useMemo(
    () => [
      image1,
      image2,
      image3,
      image4,
      image5,
      image6,
      image7,
      image8,
      image9,
      image10,
    ],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % images.length;
        document.documentElement.style.backgroundImage = `url(${images[newIndex]})`;
        return newIndex;
      });
    }, 1 * 60 * 1000);
    // }, 10 * 1000);
    return () => clearInterval(interval);
  }, [images]);
  useEffect(() => {
    if (location.pathname === "/") {
      document.documentElement.style.backgroundImage = `url(${images[bgImageIndex]})`;
    } else {
      document.documentElement.style.background = "white";
      document.documentElement.style.backgroundImage = "none";
    }
  }, [bgImageIndex, images, location.pathname]);

  // useEffect(() => {
  //   // Check if the user is on the login/signup pages or if they're logged in
  //   const whiteBackgroundRoutes = [
  //     "/login",
  //     "/signup",
  //     "/restaurants/nearby",
  //     "/favorites",
  //     "/restaurants",
  //     "/menu-item"
  //   ];

  //   const isMenuItemDetailPage = /^\/restaurant\/\d+\/menu-item\/\d+$/.test(location.pathname);

  //   // Using .some() to check if location.pathname matches any of the routes
  //   if (
  //     whiteBackgroundRoutes.some((route) => location.pathname.startsWith(route)) ||
  //     isMenuItemDetailPage
  //   ) {
  //     document.documentElement.style.background = "white";
  //     document.documentElement.style.backgroundImage = "none";
  //   } else {
  //     document.documentElement.style.backgroundImage = `url(${images[bgImageIndex]})`;
  //   }
  // }, [sessionUser, bgImageIndex, images, location.pathname]);

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
