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
  console.log(
    "🚀 ~ file: index.js:14 ~ ShoppingCart ~ restaurantId:",
    restaurantId
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
  console.log('Cart Item IDs:', cartItemIds);
  console.log('Cart Items by ID:', cartItemsById);

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
//   return (
//     <div className="shopping-cart-container">
//       <div className="shopping-cart-header">
//         <h1>{`${restaurantData?.name} (${restaurantData?.street_address})`}</h1>
//         <ClearShoppingCart />
//       </div>
//       {cartItemIds.length > 0 ? (
//         <>
//           <div className="shopping-cart-summary">
//             <span>{cartItemIds.length} item(s)</span>
//             <span>Total: ${cartTotalPrice.toFixed(2)}</span>
//           </div>
//           <ul className="shopping-cart-ul" ref={ulRef}>
//             {cartItemIds.map((itemId) => {
//               const item = cartItemsById[itemId];
//               if (!item) {
//                 console.error(`No item found for id ${itemId}`, cartItemsById);
//                 return null;
//               }

//               const menuItemDetails = menuItem[item.menu_item_id];
//               if (!menuItemDetails) {
//                 console.error(`No menu item details found for menu item id ${item.menu_item_id}`, menuItem);
//                 return null;
//               }

//               const itemName = menuItemDetails.name;
//               const itemImage = menuItemDetails.image_paths ? menuItemDetails.image_paths[0] : '';

//               return (
//                 <li key={itemId} className="cart-item">
//                   <div className="cart-item-name">
//                     {itemImage && <img src={itemImage} alt={itemName} style={{ width: '50px', height: '50px' }} />}
//                     <span>{itemName}</span>
//                   </div>
//                   <div className="cart-item-details">
//                     <span>Qty: {item.quantity}</span>
//                     <span>${(menuItemDetails.price * item.quantity).toFixed(2)}</span>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//           <div className="shopping-cart-total">
//             <strong>Total</strong>
//             <span>Total: ${cartTotalPrice.toFixed(2)}</span>
//           </div>
//           <button onClick={handleCreateOrder} className="checkout-button">
//             Go to checkout
//           </button>
//           <button onClick={handleAddItems} className="add-items-button">
//             Add items
//           </button>
//         </>
//       ) : (
//         <p>Your cart is empty.</p>
//       )}
//     </div>
//   );
// }

// /**
//  * ShoppingCart Component
//  *
//  * This component provides an interface to view all items in the user's shopping cart.
//  * It fetches and displays the current shopping cart items, and for each item, it renders
//  * a DeleteShoppingCart component to allow item deletion.
//  */
// import React, { useEffect } from "react";
// import { useSelector, useDispatch, shallowEqual } from "react-redux";
// import { useParams } from "react-router-dom";
// import { thunkFetchCurrentCart } from "../../../store/shoppingCarts";
// import { thunkCreateOrderFromCart } from "../../../store/orders";
// import { thunkGetMenuItemDetails } from "../../../store/menuItems";
// import DeleteShoppingCart from "../DeleteShoppingCart";
// import EditShoppingCart from "../EditShoppingCart";
// import ClearShoppingCart from "../ClearShoppingCart";

// import { calculateTotal } from "../../../assets/helpers/helpers";
// import "./ShoppingCart.css";

// export default function ShoppingCart() {
//   // Hook to allow component to dispatch actions to the Redux store
//   const dispatch = useDispatch();

//   // Redux state selectors to extract necessary data from the Redux store
//  // Selectors to pull in data from the Redux store
//   // State selectors to retrieve cart, menu items, and restaurant details
//   const cartItemIds = useSelector((state) => state.shoppingCarts.items.allIds);
//   const createdOrder = useSelector((state) => state.orders.createdOrder);
//   console.log("🚀 ~ file: index.js:30 ~ ShoppingCart ~ createdOrder:", createdOrder)
//   console.log("🚀 ~ file: index.js:29 ~ ShoppingCart ~ cartItemIds:", cartItemIds)
//   const cartItemsById = useSelector((state) => state.shoppingCarts.items.byId);
//   console.log("🚀 ~ file: index.js:31 ~ ShoppingCart ~ cartItemsById:", cartItemsById)
//   const menuItemNamesById = useSelector((state) => state.shoppingCarts.menuItemNames.byId);
//   console.log("🚀 ~ file: index.js:33 ~ ShoppingCart ~ menuItemNamesById :", menuItemNamesById )

//   const menuItemsDetailsById = useSelector((state) => state.menuItems.singleMenuItem.byId);
//   console.log("🚀 ~ file: index.js:36 ~ ShoppingCart ~ menuItemsDetailsById:", menuItemsDetailsById)

// const menuItemImagesById = useSelector((state) => state.menuItems.menuItemImages.byId);
// console.log("🚀 ~ file: index.js:37 ~ ShoppingCart ~ menuItemImagesById:", menuItemImagesById)

//   const restaurantId = useSelector((state) => state.shoppingCarts.restaurantId, shallowEqual);
//   console.log("*******file: index.js:40 ~ ShoppingCart ~ restaurantId :", restaurantId )
//   const restaurantData = useSelector((state) => state.restaurants?.singleRestaurant?.byId[restaurantId] || null, shallowEqual);
//   console.log("🚀 ~ file: index.js:42 ~ ShoppingCart ~ restaurantData:", restaurantData)
//   const isLoading = useSelector((state) => state.shoppingCarts.isLoading);
//   const error = useSelector((state) => state.shoppingCarts.error);

//  // Calculates the subtotal price for a single cart item based on its ID
//    // Derived state to calculate total prices
//    const calculateSubtotal = (itemId) => {
//     const itemDetails = menuItemsDetailsById[itemId];
//     const itemQuantity = cartItemsById[itemId]?.quantity || 0;
//     return (itemDetails?.price || 0) * itemQuantity;
//   };
//   const cartTotalPrice = cartItemIds.reduce((total, itemId) => total + calculateSubtotal(itemId), 0);

//   // Check if all details are available
//   const allDetailsAvailable = cartItemIds.every((itemId) => !!menuItemsDetailsById[itemId]);
//   // useEffect(() => {
//   //   console.log("🚀 ~ file: index.js:30 ~ ShoppingCart ~ createdOrder:", createdOrder);
//   // }, [createdOrder]);

//   // Effect to fetch the current shopping cart when the component is mounted
//   useEffect(() => {
//     dispatch(thunkFetchCurrentCart());

//     cartItemIds.forEach((itemId) => {
//       dispatch(thunkGetMenuItemDetails(itemId)).then(() => {
//         console.log('~ file:Dispatched thunkGetMenuItemDetails for item:', itemId);
//         // Log the state after dispatch to ensure it's updated
//         console.log('~ file:Current state of menuItemsDetailsById:', menuItemsDetailsById);
//       });
//     });
//   }, [dispatch, cartItemIds]);

//   console.log("+++-Cart Item IDs:", cartItemIds);
// console.log("+++-Cart Items By ID:", cartItemsById);
//   // Event handler to create an order from the cart
// // ...

// // Event handler to create an order from the cart
// // Event handler to create an order from the cart
// const handleCreateOrder = () => {
//   if (!isLoading) {
//     dispatch(thunkCreateOrderFromCart())
//       .then((order) => {
//         console.log("Order created successfully", order);
//         // Navigate to success page or reset cart here
//       })
//       .catch((error) => {
//         console.error("Error creating the order", error);
//       });
//   } else {
//     console.log("Please wait, cart items are loading.");
//   }
// };

// const handleAddItems = () => {
//   if (!isLoading) {
//     console.log("Navigate to menu or open modal to add items.");
//     // Navigate to menu or open modal here
//   } else {
//     console.log("Please wait, cart items are loading.");
//   }
// };
//   // Render the shopping cart and its items
// // Main render function for ShoppingCart component
//   // Main component render
// // Main component render
// return (
//   <div className="shopping-cart-container">
//     {cartItemIds.length > 0 ? (
//       <>
//         <div className="shopping-cart-header">
//           <h1>{`${restaurantData?.name}® (${restaurantData?.street_address})`}</h1>
//           <ClearShoppingCart />
//         </div>
//         <div className="shopping-cart-summary">
//           <span>{cartItemIds.length} item(s)</span>
//           <span>Total: ${createdOrder ? createdOrder.total_price.toFixed(2) : cartTotalPrice.toFixed(2)}</span>
//         </div>

//         <div className="shopping-cart-total">
//           <strong>Total</strong>
//           <span>Total: ${createdOrder ? createdOrder.total_price.toFixed(2) : cartTotalPrice.toFixed(2)}</span>
//         </div>
//         <button onClick={handleCreateOrder} className="checkout-button">
//           Go to checkout
//         </button>
//         <button onClick={handleAddItems} className="add-items-button">
//           Add items
//         </button>
//       </>
//     ) : (
//       <p>Your cart is empty.</p>
//     )}
//   </div>
// );
// // return (
// //   <div className="shopping-cart-container">
// //     {cartItemIds.length > 0 ? (
// //       <>
// //         <div className="shopping-cart-header">
// //           <h1>{`${restaurantData?.name}® (${restaurantData?.street_address})`}</h1>
// //           <ClearShoppingCart />
// //         </div>
// //         <div className="shopping-cart-summary">
// //           <span>{cartItemIds.length} item(s)</span>
// //           <span>Subtotal: ${cartTotalPrice.toFixed(2)}</span>
// //         </div>

// //         <div className="shopping-cart-total">
// //           <strong>Total</strong>
// //           <span>${cartTotalPrice.toFixed(2)}</span>
// //         </div>
// //         <button onClick={handleCreateOrder} className="checkout-button">
// //           Go to checkout
// //         </button>
// //         <button onClick={handleAddItems} className="add-items-button">
// //           Add items
// //         </button>
// //       </>
// //     ) : (
// //       <p>Your cart is empty.</p>
// //     )}
// //   </div>
// // );
//     }
//   //   return (
//   //     <div className="shopping-cart-container">
//   //     <div className="shopping-cart-header">
//   //       <h1>{`${restaurantName}® (${restaurantAddress})`}</h1>
//   //       <ClearShoppingCart />
//   //     </div>
//   //       {/* <ClearShoppingCart /> */}
//   //       {cartItemIds.length > 0 ? (
//   //         <>
//   //           <ul className="shopping-cart-ul">
//   //             {/* Iterate over each cart item and render the DeleteShoppingCart and EditShoppingCart components */}
//   //             {cartItemIds.map((itemId) => {
//   //               const item = cartItemsById[itemId];

//   //               console.log("itemName: ", menuItemNames)
//   //               return (
//   //                 <li key={itemId} className="cart-item">
//   //                   <div className="item-details">
//   //                     <span className="item-name">{menuItemNames}</span>{" "}
//   //                     {/* Display the item name */}
//   //                     <span className="item-quantity">
//   //                       {/* Qty: {item.quantity} */}
//   //                     </span>{" "}
//   //                     {/* Display the item quantity */}
//   //                   </div>
//   //                   <div className="item-actions">
//   //                     <EditShoppingCart itemId={itemId} />
//   //                     <DeleteShoppingCart item={item} itemName={menuItemNames} />
//   //                   </div>
//   //                 </li>
//   //               );
//   //             })}
//   //           </ul>
//   //           <button onClick={handleCreateOrder} className="create-order-button">
//   //             Checkout
//   //           </button>
//   //         </>
//   //       ) : (
//   //         <p>Your cart is empty.</p>
//   //       )}
//   //     </div>
//   //   );
