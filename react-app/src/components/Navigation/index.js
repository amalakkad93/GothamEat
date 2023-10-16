import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import OpenModalMenuItem from "./OpenModalMenuItem";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faBars, faUser } from '@fortawesome/free-solid-svg-icons';
import "./Navigation.css";

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  return (
    <>
      <div className="navBar-container">
        <div className="navBar-inner-container">
          <div className="navBar-left">
            {isLoaded && (
              <ul><ProfileButton user={sessionUser} showMenu={showMenu} /></ul>
            )}
            <NavLink exact to="/" className="navbar-logo">
							<div className="logo-container">
								<h1 className="logo-h1-first">Starco</h1>
              	<h1 className="logo-h1-second">Eats</h1>
							</div>
            </NavLink>
          </div>

          <div className="navBar-spacer"></div>

          <div className="navBar-right">
            {/* <button
              className="cart-btn"
              type="button"
              onClick={() => alert("Feature Coming Soon...")}
            >
              <i
                className="fas fa-shopping-cart"
                style={{ marginRight: "6px" }}
              ></i>
              Cart
            </button> */}
            {sessionUser ? null : (
              <>
							<div className="login-btn">
                <OpenModalMenuItem
                  itemText={
										<div className="login-btn-word-logo-user-circle">
                    	  <FontAwesomeIcon icon={faUser} className="menu-icon" /> Log in

										</div>
                  }
                  onItemClick={closeMenu}
                  modalComponent={<LoginFormModal />}
                />
							</div>
							<div className="signup-btn">
                <OpenModalMenuItem
                  itemText="Sign up"
                  onItemClick={closeMenu}
                  modalComponent={<SignupFormModal />}
                />
							</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navigation;
