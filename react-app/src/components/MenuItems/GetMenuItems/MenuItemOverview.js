/**
 * MenuItemOverview Component
 *
 * This component is responsible for displaying a detailed overview of an individual menu item.
 * It provides the user with a magnified image of the menu item, the name, description, price,
 * and options to select the quantity and add the item to the cart.
 *
 * Users can also view the name and description of the menu item, select its quantity,
 * and add it to their cart.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { thunkGetMenuItemDetails } from "../../../store/menuItems";
import { thunkCreateOrder } from "../../../store/orders";
import { thunkAddItemToCart, addToCart } from "../../../store/shoppingCarts";
import ReactImageMagnify from "react-image-magnify";
import ShoppingCart from "../../ShoppingCarts/GetShoppingCarts";
import "./MenuItemOverview.css";

export default function MenuItemOverview() {
  // Route parameters
  const { itemId, restaurantId } = useParams();
  const [isCartVisible, setIsCartVisible] = useState(false);

  // Redux dispatch for action invocations
  const dispatch = useDispatch();

  // React router hook for navigation
  const navigate = useNavigate();

  // User data from Redux state
  const userId = useSelector((state) => state.session.user.id, shallowEqual);

  // Menu item data from Redux state
  const allIds = useSelector(
    (state) => state.menuItems.singleMenuItem.allIds,
    shallowEqual
  );
  const byId = useSelector(
    (state) => state.menuItems.singleMenuItem.byId,
    shallowEqual
  );
  const menuItemImgs = useSelector(
    (state) => state.menuItems?.menuItemImages?.byId || {},
    shallowEqual
  );

  // Derive menu item details based on fetched data
  const menuItemId = allIds[0];
  const menuItem = byId ? byId[menuItemId] : undefined;

  // Get the most recent state for the menu item using its ID
  const currentMenuItem = useSelector(
    (state) => state.menuItems.singleMenuItem.byId[menuItemId],
    shallowEqual
  );

  const error = useSelector((state) => state.menuItems?.error, shallowEqual);

  // Local state to manage the selected quantity for the menu item
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  let isMounted = true; // Flag to track mounted state

  setIsLoading(true);
  dispatch(thunkGetMenuItemDetails(itemId))
    .then(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    })
    .catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

  return () => {
    isMounted = false; // Set the flag to false when the component unmounts
  };
}, [dispatch, itemId]);


  // Logic to determine the image path of the menu item
  let menuItemImgPath;
  if (menuItem?.image_paths?.length > 0) {
    menuItemImgPath = menuItem.image_paths[0];
  }

  // Configurations for the magnified image view
  const smallImageConfig = {
    alt: menuItem?.name,
    isFluidWidth: true,
    src: menuItemImgPath,
  };

  const largeImageConfig = {
    src: menuItemImgPath,
    width: 1200,
    height: 1800,
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  /**
   * handleAddToCart
   *
   * This function attempts to add the selected menu item to the user's cart.
   * It dispatches necessary actions to the Redux store to update the state.
   * If the action is successful, the user is navigated back to the restaurant's page.
   */
  const handleAddToCart = async () => {
    if (!menuItem) {
      console.error("Menu item data not yet available.");
      return;
    }
    console.log(
      `Attempting to add to cart: menuItemId=${menuItemId}, quantity=${quantity}, restaurantId=${restaurantId}`
    );
    try {

      const message = await dispatch(
        thunkAddItemToCart(menuItemId, quantity, restaurantId)
      );
      console.log("==restaurantId in MenuItemOverview: ", restaurantId);
      if (message) {
        alert(message);
      }
      // Convert quantity to a number before dispatching the action
      const numericQuantity = Number(quantity);

      // Update the cart state in Redux
      dispatch(addToCart(menuItemId, numericQuantity, menuItem));
      setIsCartVisible(true);
      // Navigate back to the restaurant page after adding the item to the cart
      navigate(`/restaurants/${restaurantId}`);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Rendering
  if (!menuItem) return <p className="menuItemOverview-p-tag">Item not found.</p>;
  if (isLoading) return <p className="menuItemOverview-p-tag">Loading...</p>;


  return (
    // Main container for the menu item overview
    <div
      className="menu-overview-main-container"
      style={{ display: "flex", padding: "20px" }}
    >
      {
        // Display magnified image of the menu item if available
        menuItemImgPath && (
          <div className="magnify-container">
            <ReactImageMagnify
              smallImage={smallImageConfig}
              largeImage={largeImageConfig}
              enlargedImagePosition="over"
            />
          </div>
        )
      }

      {/* Container for the text content of the menu item */}
      <div className="overview-text-content">
        {/* Display menu item's name and description */}
        <h1 className="menuItemOverview-h1-tag">{`${menuItem.name}®(${menuItem.description})`}</h1>
        <hr className="gray-line" />

        {/* Display the price of the menu item */}
        <p className="menuItemOverview-p-tag">Price: ${menuItem.price}</p>
        <hr className="gray-line" />

        {/* <ShoppingCart menuItemId={menuItemId} /> */}

        {/* Dropdown for selecting the quantity of the menu item */}
        <p className="menuItemOverview-p-tag">
          Quantity:
          <select
            value={quantity}
            onChange={handleQuantityChange}
          >
            {
              // Generate options for quantity from 1 to 10
              [...Array(10).keys()].map((num) => (
                <option key={num + 1} value={num + 1}>
                  {num + 1}
                </option>
              ))
            }
          </select>
        </p>
        <hr className="gray-line" />

        {/* Button to add the menu item to the shopping cart */}
        <div className="button-container">
          <button
            className="menuItemOverview-btn"
            onClick={() => navigate(`/restaurants/${restaurantId}`)}
          >
            Back to the Menu
          </button>
          <button className="menuItemOverview-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
