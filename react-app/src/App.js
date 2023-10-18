import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation } from "react-router-dom";
import { authenticate } from "./store/session";
import Navigation from "./components/Navigation";
import Home from "./components/Home";
import SignupFormPage from "./components/SignupFormPage";
import LoginFormPage from "./components/LoginFormPage";

import image1 from "./assets/image1.png"
import image2 from "./assets/image2.jpg"
import image3 from "./assets/image3.jpg"
import image4 from "./assets/image4.jpg"
import image5 from "./assets/image5.jpg"
import image6 from "./assets/image6.jpg"
import image7 from "./assets/image7.jpg"
import image8 from "./assets/image8.jpg"
import image9 from "./assets/image9.jpg"
import image10 from "./assets/image10.jpg"

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const sessionUser = useSelector(state => state.session.user);

  const [isLoaded, setIsLoaded] = useState(false);
  const [bgImageIndex, setBgImageIndex] = useState(0);

  const images = useMemo(() => [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % images.length;
        document.documentElement.style.backgroundImage = `url(${images[newIndex]})`;
        return newIndex;
      });
    }, 10* 60 * 1000);
    // }, 10 * 1000);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    // Check if the user is on the login/signup pages or if they're logged in
    if (location.pathname === "/login" || location.pathname === "/signup" ) {
        document.documentElement.style.background = 'white';
        document.documentElement.style.backgroundImage = 'none';
    } else {
        document.documentElement.style.backgroundImage = `url(${images[bgImageIndex]})`;
    }
}, [sessionUser, bgImageIndex, images, location.pathname]);


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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginFormPage />} />
          <Route path="/signup" element={<SignupFormPage />} />
          <Route>Page Not Found</Route>
        </Routes>
      )}
    </>
);

}

export default App;

// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { Route, Switch } from "react-router-dom";
// import SignupFormPage from "./components/SignupFormPage";
// import LoginFormPage from "./components/LoginFormPage";
// import { authenticate } from "./store/session";
// import Navigation from "./components/Navigation";
// import Home from './components/Home/index';

// function App() {
//   const dispatch = useDispatch();
//   const [isLoaded, setIsLoaded] = useState(false);
//   useEffect(() => {
//     dispatch(authenticate()).then(() => setIsLoaded(true));
//   }, [dispatch]);

//   return (
//     <>
//       <Navigation isLoaded={isLoaded} />
//       {isLoaded && (
//         <Switch>
//           <Route path="/login" >
//             <LoginFormPage />
//           </Route>
//           <Route path="/signup">
//             <SignupFormPage />
//           </Route>
//         </Switch>
//       )}
//     </>
//   );
// }

// export default App;
