import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom"; // Change from Switch to Routes
import { authenticate } from "./store/session";

import Navigation from "./components/Navigation";
import Home from "./components/Home"

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgImageIndex, setBgImageIndex] = useState(0);
  const images = [
    "assets/image1.png",
    "assets/image2.jpg",
    "assets/image3.jpg",
    "assets/image4.jpg",
    "assets/image5.jpg",
    "assets/image6.jpg",
    "assets/image7.jpg",
    "assets/image8.jpg",
    "assets/image9.jpg",
    "assets/image10.jpg",

  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      document.documentElement.style.backgroundImage = `url(${images[bgImageIndex]})`;
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [bgImageIndex, images]);

  useEffect(() => {
    dispatch(authenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<div>Page Not Found</div>} />
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
