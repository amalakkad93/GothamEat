import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/session";
import * as sessionActions from '../../store/session';
import { useModal } from '../../context/Modal';
import { useNavigate, Link } from "react-router-dom";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import SlidingModal from "../SlidingModal/SlidingModal"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import OpenModalMenuItem from './OpenModalMenuItem';

import './ProfileButton.css';
// import CreateMenuItemForm from "../MenuItems/MenuItemForm/CreateMenuItemForm";

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  const navigate = useNavigate();
  const userInitials = user && `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  const sessionUser = useSelector((state) => state.session.user);

  const openMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', closeMenu);
    } else {
      document.removeEventListener('click', closeMenu);
    }

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    navigate('/');
  };

  const ulClassName = "profile-dropdown";

  return (
    <>
      <div className="profile-dropdown-container">
        <div className="btn">
          <button className="navigation-btn" aria-label="Main navigation menu" onClick={openMenu}>
            {!user ? (
              <>
                <FontAwesomeIcon icon={faBars} className="menu-icon" />
                {/* <FontAwesomeIcon icon={faUserCircle} className="profile-icon" /> */}
              </>
            ) : (
              <>
                <div className="user-initials1">
                <FontAwesomeIcon icon={faBars} className="menu-icon" />
                  {/* {userInitials.toUpperCase()} */}
                </div>
              </>
            )}
          </button>
        </div>
        <div className="menu-drop-down">

        {/* SlidingModal start here */}
        <SlidingModal isVisible={showMenu} onClose={closeMenu}>
          <ul className={ulClassName} ref={ulRef} style={{ display: showMenu ? 'block' : 'none' }}>
            {user ? (
              <>
                <li className="center-menu greeting">Hello, {user.firstName}</li>
                <li className="center-menu email">{user.email}</li>
                <hr />
                <ul className="center-menu">
                  <Link to="/users/show" onClick={closeMenu} style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faUserCircle} style={{ marginRight: '8px' }} />
                    <li className="center-menu center-menu-profile">Your Profile</li>
                  </Link>

                  <li className="center-menu"><button className="Manage-spot-button center-menu1" onClick={(e) => { closeMenu(); navigate(`/owner/restaurants`) }}>Manage Restaurants</button></li>

                  <li>
                    <button
                      className="Manage-spot-button center-menu1"
                      onClick={(e) => {
                        closeMenu();
                        navigate('/restaurants/new', { formType: "Create", userId: sessionUser.id });
                      }}
                    >
                      Add your Restaurant
                    </button>
                  </li>

                  <li><button onClick={logout} className="buttons center-menu center-menu1">Log Out</button></li>
                </ul>
              </>
            ) : (
              <>
                <div className="center-menu-signUp">
                  <button className="center-menu-signUp" onClick={(e) => { closeMenu(); navigate(`/signup`) }}>Sign up</button>
                </div>
                <div className="center-menu-login">
                  <button className="center-menu-login" onClick={(e) => { closeMenu(); navigate(`/login`) }}>Log in</button>
                </div>
              </>
            )}
          </ul>
      </SlidingModal>
        </div>
      </div>
    </>
  );
}

export default ProfileButton;
