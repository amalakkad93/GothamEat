import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import ProfileButton from "./ProfileButton";
import SlidingModalRight from "../Modals/SlidingModal/SlidingModalRight";
import ShoppingCart from "../ShoppingCarts/GetShoppingCarts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { authenticate } from '../../store/session';
import logo from "../../assets/logo.png";
import "./Navigation.css";

function Navigation({ isLoaded }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user, shallowEqual);
  const [isLoading, setIsLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    dispatch(authenticate()).then(() => setIsLoading(false));
  }, [dispatch]);

  if (isLoading) return null;
  return (
    <div className="navBar-inner-container">
      <div className="profile-btn-logo-container">
      {isLoaded && (
        <ProfileButton
          user={sessionUser}
          onModalVisibilityChange={ (isVisible) => setNavVisible(!isVisible)}
        />
      )}

      <div className="navBar-left">
        <NavLink exact to="/" className="navbar-logo">
          <div className="logo-container">
            <img src={logo} alt="logo" className="logo-img" />
            <h1 className="logo-h1-first">Starco</h1>
            <h1 className="logo-h1-second">Eats</h1>
          </div>
        </NavLink>
      </div>
      </div>

      <div className="navBar-spacer"></div>

      <div className="navBar-right">
        {sessionUser && sessionUser ? (
          <>
            <button
              className="cart-btn"
              type="button"
              onClick={() => setCartVisible(!cartVisible)}
            >
              <FontAwesomeIcon
                icon={faShoppingCart}
                style={{ color: "white", marginRight: "6px" }}
              />
              Cart
            </button>
            {/* Sliding Modal for Shopping Cart */}
            <SlidingModalRight isVisible={cartVisible} onClose={() => setCartVisible(!cartVisible)}>
              <ShoppingCart onClose={() => setCartVisible(!cartVisible)} />
            </SlidingModalRight>
          </>
        ) : (
          <>
            <div className="login-btn1">
              <button className="login-btn" onClick={() => navigate(`/login`)}>
                Log in
              </button>
            </div>
            <div className="signup-btn1">
              <button
                className="signup-btn"
                onClick={() => navigate(`/signup`)}
              >
                Sign up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Navigation;

// import React, { useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import ProfileButton from "./ProfileButton";
// import "./Navigation.css";

// function Navigation({ isLoaded }) {
//   const sessionUser = useSelector((state) => state.session.user);
//   const navigate = useNavigate();
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [navVisible, setNavVisible] = useState(true);

//   return (
//     <>
//       {navVisible && (
//         <div className="navBar-inner-container">
//           <div className="navBar-left">
//             {isLoaded && (
//               <ul>
//                 <ProfileButton
//                   user={sessionUser}
//                   onProfileClick={() => setNavVisible(false)}
//                   onCloseMenu={() => setNavVisible(true)}
//                 />

//               </ul>
//             )}

//             <NavLink exact to="/" className="navbar-logo">
//               <div className="logo-container">
//                 <h1 className="logo-h1-first">Starco</h1>
//                 <h1 className="logo-h1-second">Eats</h1>
//               </div>
//             </NavLink>
//           </div>

//           <div className="navBar-spacer"></div>

//           <div className="navBar-right">
//             {!sessionUser && (
//               <>
//                 <div className="login-btn">
//                   <button
//                     className="login-btn"
//                     onClick={(e) => {
//                       navigate(`/login`);
//                     }}
//                   >
//                     Log in
//                   </button>
//                 </div>
//                 <div className="signup-btn">
//                   <button
//                     className="signup-btn"
//                     onClick={(e) => {
//                       navigate(`/signup`);
//                     }}
//                   >
//                     Sign up
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default Navigation;

// import React, { useState, useEffect, useRef } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import ProfileButton from "./ProfileButton";
// import LoginFormModal from "../LoginFormModal";
// import SignupFormModal from "../SignupFormModal";
// import OpenModalMenuItem from "./OpenModalMenuItem";

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faUserCircle, faBars, faUser } from '@fortawesome/free-solid-svg-icons';
// import "./Navigation.css";

// function Navigation({ isLoaded }) {
//   const sessionUser = useSelector((state) => state.session.user);
//   console.log("****************sessionUser", sessionUser)
//   const navigate = useNavigate();
//   const [showMenu, setShowMenu] = useState(false);
//   const ulRef = useRef();
//   useEffect(() => {
//     if (!showMenu) return;

//     const closeMenu = (e) => {
//       if (!ulRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };

//     document.addEventListener("click", closeMenu);

//     return () => document.removeEventListener("click", closeMenu);
//   }, [showMenu]);

//   const closeMenu = () => setShowMenu(false);

//   return (
//     <>

//         <div className="navBar-inner-container">
//           <div className="navBar-left">
//             {isLoaded && (
//               <ul><ProfileButton user={sessionUser} showMenu={showMenu} /></ul>
//             )}
//             <NavLink exact to="/" className="navbar-logo">
// 							<div className="logo-container">
// 								<h1 className="logo-h1-first">Starco</h1>
//               	<h1 className="logo-h1-second">Eats</h1>
// 							</div>
//             </NavLink>
//           </div>

//           <div className="navBar-spacer"></div>

//           <div className="navBar-right">
// {/* <button
//   className="cart-btn"
//   type="button"
//   onClick={() => alert("Feature Coming Soon...")}
// >
//   <i
//     className="fas fa-shopping-cart"
//     style={{ marginRight: "6px" }}
//   ></i>
//   Cart
// </button> */}
//             {sessionUser ? null : (
//               <>
// 							<div className="login-btn">
//                 <button className="login-btn" onClick={(e) => { closeMenu(); navigate(`/login`) }}>
//                   <div className="login-btn-word-logo-user-circle">
//                     <FontAwesomeIcon icon={faUser} className="menu-icon" /> Log in
// 							  	</div>
//                 </button>
// 							</div>
// 							<div className="signup-btn">
//                 <button className="signup-btn" onClick={(e) => { closeMenu(); navigate(`/signup`) }}>
//                      Sign up
//                 </button>
// 							</div>
//               </>
//             )}
//           </div>
//         </div>
//     </>
//   );
// }

// export default Navigation;

// import React, { useState, useEffect, useRef } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import ProfileButton from "./ProfileButton";
// import OpenModalMenuItem from "./OpenModalMenuItem";
// import OpenModalButton from "../OpenModalButton";

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faUserCircle, faBars, faUser } from '@fortawesome/free-solid-svg-icons';
// import "./Navigation.css";

// function Navigation({ isLoaded }) {
//   const sessionUser = useSelector((state) => state.session.user);
//   console.log("****************sessionUser", sessionUser)
//   const navigate = useNavigate();
//   const [showMenu, setShowMenu] = useState(false);
//   const ulRef = useRef();
//   useEffect(() => {
//     if (!showMenu) return;

//     const closeMenu = (e) => {
//       if (!ulRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };

//     document.addEventListener("click", closeMenu);

//     return () => document.removeEventListener("click", closeMenu);
//   }, [showMenu]);

//   const closeMenu = () => setShowMenu(false);

//   return (
//     <>
//       <div className="navBar-container">
//         <div className="navBar-inner-container">
//           <div className="navBar-left">
//             {isLoaded && (
//               // <ul><ProfileButton user={sessionUser} showMenu={showMenu} /></ul>
// <OpenModalButton
//   modalComponent={<ProfileButton user={sessionUser} />}
//   buttonText={sessionUser ? `${sessionUser.first_name.charAt(0)}${sessionUser.last_name.charAt(0)}` : <FontAwesomeIcon icon={faBars} className="menu-icon" />}
//   onButtonClick={closeMenu}
//   sliding={true}
// />
//             )}
//             <NavLink exact to="/" className="navbar-logo">
// 							<div className="logo-container">
// 								<h1 className="logo-h1-first">Starco</h1>
//               	<h1 className="logo-h1-second">Eats</h1>
// 							</div>
//             </NavLink>
//           </div>

//           <div className="navBar-spacer"></div>

//           <div className="navBar-right">
//             {/* <button
//               className="cart-btn"
//               type="button"
//               onClick={() => alert("Feature Coming Soon...")}
//             >
//               <i
//                 className="fas fa-shopping-cart"
//                 style={{ marginRight: "6px" }}
//               ></i>
//               Cart
//             </button> */}
//             {sessionUser ? null : (
//               <>
// 							<div className="login-btn">
//                 <button className="login-btn" onClick={(e) => { closeMenu(); navigate(`/login`) }}>
//                   <div className="login-btn-word-logo-user-circle">
//                     <FontAwesomeIcon icon={faUser} className="menu-icon" /> Log in
// 							  	</div>
//                 </button>
// 							</div>
// 							<div className="signup-btn">
//                 <button className="signup-btn" onClick={(e) => { closeMenu(); navigate(`/signup`) }}>
//                      Sign up
//                 </button>
// 							</div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Navigation;

// import React, { useState, useEffect, useRef } from "react";
// import { NavLink } from "react-router-dom";
// import { useSelector } from "react-redux";
// import ProfileButton from "./ProfileButton";
// import LoginFormModal from "../LoginFormModal";
// import SignupFormModal from "../SignupFormModal";
// import OpenModalMenuItem from "./OpenModalMenuItem";

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faUserCircle, faBars, faUser } from '@fortawesome/free-solid-svg-icons';
// import "./Navigation.css";

// function Navigation({ isLoaded }) {
//   const sessionUser = useSelector((state) => state.session.user);
//   const [showMenu, setShowMenu] = useState(false);
//   const ulRef = useRef();
//   useEffect(() => {
//     if (!showMenu) return;

//     const closeMenu = (e) => {
//       if (!ulRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };

//     document.addEventListener("click", closeMenu);

//     return () => document.removeEventListener("click", closeMenu);
//   }, [showMenu]);

//   const closeMenu = () => setShowMenu(false);

//   return (
//     <>
//       <div className="navBar-container">
//         <div className="navBar-inner-container">
//           <div className="navBar-left">
//             {isLoaded && (
//               <ul><ProfileButton user={sessionUser} showMenu={showMenu} /></ul>
//             )}
//             <NavLink exact to="/" className="navbar-logo">
// 							<div className="logo-container">
// 								<h1 className="logo-h1-first">Starco</h1>
//               	<h1 className="logo-h1-second">Eats</h1>
// 							</div>
//             </NavLink>
//           </div>

//           <div className="navBar-spacer"></div>

//           <div className="navBar-right">
//             {/* <button
//               className="cart-btn"
//               type="button"
//               onClick={() => alert("Feature Coming Soon...")}
//             >
//               <i
//                 className="fas fa-shopping-cart"
//                 style={{ marginRight: "6px" }}
//               ></i>
//               Cart
//             </button> */}
//             {sessionUser ? null : (
//               <>
// 							<div className="login-btn">
//                 <OpenModalMenuItem
//                   itemText={
// 										<div className="login-btn-word-logo-user-circle">
//                     	  <FontAwesomeIcon icon={faUser} className="menu-icon" /> Log in

// 										</div>
//                   }
//                   onItemClick={closeMenu}
//                   modalComponent={<LoginFormModal />}
//                 />
// 							</div>
// 							<div className="signup-btn">
//                 <OpenModalMenuItem
//                   itemText="Sign up"
//                   onItemClick={closeMenu}
//                   modalComponent={<SignupFormModal />}
//                 />
// 							</div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Navigation;
