import React, { useState, useEffect, useRef, useContext } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import * as sessionActions from "../../store/session";
import { useNavigate, Link } from "react-router-dom";
import SlidingModalLeft from "../Modals/SlidingModal/SlidingModalLeft";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faBars } from "@fortawesome/free-solid-svg-icons";
import { persistor } from "../../index.js";
import PersistorContext from "../../context/PersistorContext";

import "./ProfileButton.css";
// import CreateMenuItemForm from "../MenuItems/MenuItemForm/CreateMenuItemForm";

export default function ProfileButton(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const persistor = useContext(PersistorContext);
  const sessionUser = useSelector((state) => state.session.user, shallowEqual);
  const isAdmin = sessionUser?.email === "amalakkad@gmail.com";
  const [showMenu, setShowMenu] = useState(false);
  const [purgeSuccessful, setPurgeSuccessful] = useState(false);
  const ulRef = useRef();

  const openMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
    props.onModalVisibilityChange && props.onModalVisibilityChange(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
    props.onModalVisibilityChange && props.onModalVisibilityChange(false);
  };

  useEffect(() => {
    const closeMenuListener = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    document.addEventListener("click", closeMenuListener);

    return () => {
      document.removeEventListener("click", closeMenuListener);
    };
  }, []);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    navigate("/");
  };
  const ulClassName = "profile-dropdown";

  // This method clears the persisted state
  const handleClearPersistedState = () => {
    persistor
      .purge()
      .then(() => {
        console.log("Persisted state cleared");
        setPurgeSuccessful(true); // Trigger to show the confirmation message
      })
      .catch((error) => {
        console.error("Failed to clear persisted state", error);
      });
  };

  return (
    <>
      <div className="profile-dropdown-container">
        <div className="btn">
          <button
            className="navigation-btn"
            aria-label="Main navigation menu"
            onClick={openMenu}
          >
            {!props.user ? (
              <>
                <FontAwesomeIcon icon={faBars} className="menu-icon" />
                {/* <FontAwesomeIcon icon={faUserCircle} className="profile-icon" /> */}
              </>
            ) : (
              <>
                <div className="user-initials1">
                  {!showMenu && (
                    <FontAwesomeIcon icon={faBars} className="menu-icon" />
                  )}
                  {/* {userInitials.toUpperCase()} */}
                </div>
              </>
            )}
          </button>
        </div>
        <div className="menu-drop-down">
          {/* SlidingModal start here */}
          <SlidingModalLeft isVisible={showMenu} onClose={closeMenu}>
            <ul
              className={ulClassName}
              ref={ulRef}
              style={{ display: showMenu ? "block" : "none" }}
            >
              {props.user ? (
                <>
                  <li className="center-menu greeting">
                    Hello, {props.user.firstName}
                  </li>
                  <li className="center-menu email">{props.user.email}</li>
                  <hr />
                  <ul className="center-menu">
                    <Link
                      to="/users/show"
                      onClick={closeMenu}
                      style={{
                        textDecoration: "none",
                        color: "black",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        style={{ marginRight: "8px" }}
                      />
                      <li className="center-menu center-menu-profile">
                        Your Profile
                      </li>
                    </Link>

                    <li className="center-menu center-menu-profile">
                      <button
                        className="Manage-spot-button center-menu1"
                        onClick={(e) => {
                          closeMenu();
                          navigate(`/favorites`);
                        }}
                      >
                        View Favorites
                      </button>
                    </li>

                    <li className="center-menu">
                      <button
                        className="Manage-spot-button center-menu1"
                        onClick={(e) => {
                          closeMenu();
                          navigate(`/owner/restaurants`);
                        }}
                      >
                        Manage Restaurants
                      </button>
                    </li>

                    <li>
                      <button
                        className="Manage-spot-button center-menu1"
                        onClick={(e) => {
                          closeMenu();
                          navigate("/create-restaurant");
                        }}
                      >
                        Add your Restaurant
                      </button>
                    </li>
                    <li>
                      <button
                        className="Manage-spot-button center-menu1"
                        onClick={(e) => {
                          closeMenu();
                          navigate("/orders");
                        }}
                      >
                        Your Orders
                      </button>
                    </li>

                    <li>
                      <button
                        onClick={logout}
                        className="buttons center-menu center-menu1"
                      >
                        Log Out
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={handleClearPersistedState}
                            className="clear-persisted-state-button"
                          >
                            Clear Persisted State
                          </button>

                          {purgeSuccessful && (
                            <div className="confirmation-message">
                              Your session has been cleared. Please reload the
                              page.
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <button
                    className="center-menu-signUp"
                    style={{
                      borderRadius: "10px",
                      width: "252px",
                      height: "56px",
                    }}
                    onClick={(e) => {
                      closeMenu();
                      navigate(`/signup`);
                    }}
                  >
                    Sign up
                  </button>

                  <button
                    className="center-menu-login"
                    style={{
                      borderRadius: "10px",
                      width: "252px",
                      height: "56px",
                    }}
                    onClick={(e) => {
                      closeMenu();
                      navigate(`/login`);
                    }}
                  >
                    Log in
                  </button>
                </>
              )}
            </ul>
          </SlidingModalLeft>
        </div>
      </div>
    </>
  );
}
