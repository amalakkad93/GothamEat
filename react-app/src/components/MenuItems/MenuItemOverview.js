import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { thunkGetMenuItemDetails } from "../../store/menuItems";
import { thunkCreateOrder } from "../../store/orders";
import { thunkAddItemToCart, addToCart } from "../../store/shoppingCarts";
import ReactImageMagnify from "react-image-magnify";
import ShoppingCart from "../ShoppingCarts/GetShoppingCarts";
import "./MenuItemOverview.css";

export default function MenuItemOverview() {
  // Fetching params
  const { itemId, restaurantId } = useParams();

  // Redux dispatch
  const dispatch = useDispatch();

  // React router hook
  const navigate = useNavigate();

  // State variable for quantity
  const [quantity, setQuantity] = useState(1);

  // Fetching user ID from the state
  const userId = useSelector((state) => state.session.user.id);

  // Redux state
  const allIds = useSelector((state) => state.menuItems.singleMenuItem.allIds);
  const byId = useSelector((state) => state.menuItems.singleMenuItem.byId);
  const menuItemImgs = useSelector(
    (state) => state.menuItems?.menuItemImages?.byId || {}
  );

  // Derived state and logic
  const menuItemId = allIds[0];
  const menuItem = byId ? byId[menuItemId] : undefined;

  // Use useSelector to get the most recent state for menuItem after defining menuItemId
  const currentMenuItem = useSelector(
    (state) => state.menuItems.singleMenuItem.byId[menuItemId]
  );

  const isLoading = useSelector((state) => state.menuItems?.isLoading);
  const error = useSelector((state) => state.menuItems?.error);

  // Fetching data using effect hook
  useEffect(() => {
    dispatch(thunkGetMenuItemDetails(itemId));
  }, [dispatch, itemId]);

  console.log("allIds:", allIds);
  console.log("byId:", byId);
  console.log("menuItemId:", menuItemId);
  console.log("menuItem:", menuItem);


  let menuItemImgPath;
  if (menuItem?.image_paths?.length > 0) {
    menuItemImgPath = menuItem.image_paths[0];
  }

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

  // const handleQuantityChange = (e) => {
  //   setQuantity(e.target.value);
  // };

  // const handleOrderSubmission = () => {
  //   // Dispatch the thunk action to create an order
  //   dispatch(thunkCreateOrder(userId, menuItem.price * quantity, [{ menu_item_id: menuItemId, quantity }]));
  // };

  const handleAddToCart = async () => {
    if (!menuItem) {
      console.error("Menu item data not yet available.");
      return;
    }
    try {
      // Add item to the cart using the thunk
      const message = await dispatch(thunkAddItemToCart(menuItemId, quantity));

      // If the thunk action returns a message, display it
      if (message) {
        alert(message);
      }

      // Check if the name is present in currentMenuItem
      console.log(
        "Name of the currentMenuItem:",
        currentMenuItem ? currentMenuItem.name : "Item not loaded yet"
      );

      // Update local Redux state using the most recent menuItem
      dispatch(addToCart(menuItemId, quantity, currentMenuItem.name)); // Passing the name here

      // Navigate to the restaurant page
      navigate(`/restaurants/${restaurantId}`);
    } catch (error) {
      // Handle any errors here, e.g., display an error message to the user
      console.error("Error adding to cart:", error);
    }
  };

  // Rendering
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!menuItem) return <p>Item not found.</p>;

  return (
    <div
      className="menu-overview-main-container"
      style={{ display: "flex", padding: "20px" }}
    >
      {menuItemImgPath && (
        <div className="magnify-container">
          <ReactImageMagnify
            smallImage={smallImageConfig}
            largeImage={largeImageConfig}
            enlargedImagePosition="over"
          />
        </div>
      )}
      <div className="overview-text-content">
        <h1>{`${menuItem.name}®(${menuItem.description})`}</h1>
        <hr className="gray-line" />
        <p>Price: ${menuItem.price}</p>
        <hr className="gray-line" />
        {/* <ShoppingCart menuItemId={menuItemId} /> */}

        <p>
          Quantity:
          <select
            value={quantity}
            // onChange={handleQuantityChange}
          >
            {[...Array(10).keys()].map((num) => (
              <option key={num + 1} value={num + 1}>
                {num + 1}
              </option>
            ))}
          </select>
        </p>
        <hr className="gray-line" />
        {/* <button onClick={handleOrderSubmission}>Add {quantity} to order • ${menuItem.price * quantity}</button> */}
        <button onClick={handleAddToCart}>Add to Cart</button>
      </div>
    </div>
  );
}
