import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { thunkFetchCurrentCart } from "../../../store/shoppingCarts";
import { thunkCreateOrderFromCart } from "../../../store/orders";
import EditShoppingCart from "../EditShoppingCart";
import ClearShoppingCart from "../ClearShoppingCart";

import "./ShoppingCart.css";

export default function GetShoppingCart({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ulRef = useRef();
  const restaurantId = useSelector(
    (state) => state.shoppingCarts.restaurantId,
    shallowEqual
  );

  const {
    cartTotalPrice,
    cartItemIds,
    cartItemsById,
    menuItem,
    restaurantData,
    isLoading,
    error,
  } = useSelector((state) => ({
    cartTotalPrice: state.shoppingCarts?.totalPrice,
    cartItemIds: state.shoppingCarts.items?.allIds,
    cartItemsById: state.shoppingCarts.cartItems?.byId,
    menuItem: state.shoppingCarts.menuItemsInfo?.byId,
    restaurantId: state.shoppingCarts?.restaurantId,
    restaurantData:
      state.restaurants?.singleRestaurant?.byId[
        state.shoppingCarts?.restaurantId
      ] || null,
    isLoading: state.shoppingCarts.isLoading,
    error: state.shoppingCarts.error,
  }));

  const menuItemImagesById = useSelector(
    (state) => state.menuItems.menuItemImages.byId
  );

  // Fetch current cart when the component mounts
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      dispatch(thunkFetchCurrentCart());
      mounted.current = true;
    }
  }, [dispatch]);

  // Handler to create an order from the cart
  const handleGoToCheckout = () => {

    navigate('/checkout', {
      state: {
        cartItems: cartItemsById,
        totalAmount: cartTotalPrice,
        restaurantData: restaurantData
      }
    });

    // dispatch(thunkClearCart());
    if (onClose) onClose();
  };
  // Handler to add items to the cart
  const handleAddItems = () => {
    if (!isLoading) {
      navigate(`/restaurants/${restaurantId}`);
      // Close the modal by calling the callback function passed via props
      if (onClose) {
        onClose();
      }
    } else {
      console.log("Please wait, cart items are loading.");
    }
  };
  return (
    <div className="shopping-cart-container">
      {cartItemIds?.length > 0 ? (
        <>
          <div className="shopping-cart-header">
            <h1 className="shopping-cart-header-h1">{`${restaurantData?.name} (${restaurantData?.street_address})`}</h1>
            <ClearShoppingCart handleAddItems={handleAddItems} />
          </div>
          <div className="shopping-cart-summary">
            <span>{cartItemIds.length} item(s)</span>
            <span>Total: ${cartTotalPrice.toFixed(2)}</span>
          </div>
          <ul className="shopping-cart-ul" ref={ulRef}>
            {cartItemIds.map((itemId) => {
              const item = cartItemsById[itemId];
              if (!item) {
                console.error(`No item found for id ${itemId}`, cartItemsById);
                return null;
              }

              const menuItemDetails = menuItem[item.menu_item_id];
              if (!menuItemDetails) {
                console.error(
                  `No menu item details found for menu item id ${item.menu_item_id}`,
                  menuItem
                );
                return null;
              }

              const itemName = menuItemDetails.name;
              const itemImage = menuItemDetails.image_paths
                ? menuItemDetails.image_paths[0]
                : "";

              return (
                <li key={itemId} className="cart-item">
                  <div className="cart-item-name">
                    {itemImage && (
                      <img
                        src={itemImage}
                        alt={itemName}
                        style={{ width: "50px", height: "50px" }}
                      />
                    )}
                    <span>{itemName}</span>
                  </div>
                  <div className="cart-item-details">
                    <EditShoppingCart itemId={itemId} />
                    <span>
                      ${(menuItemDetails.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="shopping-cart-total">
            <strong>Total</strong>
            <span>${cartTotalPrice.toFixed(2)}</span>
          </div>
          <button onClick={handleGoToCheckout} className="checkout-button">
          Go to checkout
          </button>
          <button onClick={handleAddItems} className="add-items-button">
            Add items
          </button>
        </>
      ) : (
        <p className="message-empty-cart-p">Your cart is empty.</p>
      )}
    </div>
  );
}
