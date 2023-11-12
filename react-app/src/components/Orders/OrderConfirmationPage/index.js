import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmationPage.css'

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure the necessary data from the location state
  const { order, delivery, payment } = location.state;

  return (
    <div className="order-confirmation-page">
      <h1>Thank you for your order!</h1>

      {/* Order Summary */}
      <div>
        <h2>Order Summary</h2>
        <p>Order ID: {order.order_id}</p>
        <ul>
          {order.items.map(item => (
            <li key={item.menu_item_id}>
              {item.name} - Qty: {item.quantity} - Price: ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <p>Total Price: ${order.total_price.toFixed(2)}</p>
      </div>

      {/* Delivery Information */}
      <div>
        <h2>Delivery Information</h2>
        <p>Address: {delivery.street_address}, {delivery.city}, {delivery.state}, {delivery.country}</p>
        <p>Postal Code: {delivery.postal_code}</p>
        <p>Cost: ${delivery.cost}</p>
      </div>

      {/* Payment Status */}
      <div>
        <h2>Payment Status</h2>
        <p>Gateway: {payment.gateway}</p>
        <p>Status: {order.status}</p>
      </div>

      <button onClick={() => navigate("/orders")}>Back to Orders</button>
    </div>
  );
};

export default OrderConfirmationPage;





// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import { thunkGetOrderDetails } from "../../../store/orders";

// import "./OrderConfirmationPage.css";

// const OrderConfirmationPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { orderId } = useParams();
//   console.log("🚀 ~ file: index.js:13 ~ OrderConfirmationPage ~ orderId:", orderId)
//   const [orderDetails, setOrderDetails] = useState(null);
//   // const orderId = location.pathname.split("/order-confirmation/")[1];
//   const debugState = useSelector(state => state);
//   console.log("--order: debugState:", debugState)
//   const reduxOrderDetails = useSelector(state => state.orders.byId[orderId]);
//   console.log("--order: Redux orderDetails:", reduxOrderDetails);

//   useEffect(() => {
//     console.log("--order: Component mounted. Fetching order details for ID:", orderId); // Enhanced log
//     if (orderId) {
//       dispatch(thunkGetOrderDetails(orderId))
//         .then((res) => {
//           console.log("--order: Thunk response received:", res); // Enhanced log
//           if (res && res.payload) {
//             setOrderDetails(res.payload);
//             console.log("--order: Order details set in state:", res.payload); // Enhanced log
//           } else {
//             console.error("Error in thunk response:", res); // Enhanced error log
//           }
//         })
//         .catch((err) => console.error("Error in thunk:", err)); // Enhanced error log
//     }
//   }, [dispatch, orderId]); // Dependency array

//   console.log("--order: Current orderDetails state:", orderDetails); // Log current state

//   if (!orderDetails) {
//     console.log("Waiting for order details...");
//     return <div>Loading order details...</div>;
//   }

//   // Destructuring for easier readability
//   const { order, orderItems, menuItems } = orderDetails;
//   const menuItemDetails = menuItems.byId;

//   const total_price = order.total_price;
//   const deliveryAddress = order.delivery
//     ? `${order.delivery.street_address}, ${order.delivery.city}, ${order.delivery.state} ${order.delivery.postal_code}, ${order.delivery.country}`
//     : "Delivery information not available";
//   const paymentStatus = order.payment
//     ? order.payment.status
//     : "Payment status not available";

//   return (
//     <div className="order-confirmation-page">
//       <h1>Thank you for your order!</h1>
//       <div className="section order-summary">
//         <h2>Order Summary</h2>
//         <div className="order-details">
//           <div className="order-id">
//             <strong>Order ID:</strong> <span>{order.id}</span>
//           </div>
//           <div className="items-purchased">
//             <strong>Items Purchased:</strong>
//             <ul>
//               {orderItems.allIds.map((itemId) => {
//                 const item = orderItems.byId[itemId];
//                 const menuItem = menuItems.byId[item.menu_item_id];
//                 return (
//                   <li key={item.id} className="item-detail">
//                     <span className="item-name">{menuItem.name}</span>
//                     <span className="item-quantity">Qty: {item.quantity}</span>
//                     <span className="item-price">
//                       Price: ${menuItem.price.toFixed(2)}
//                     </span>
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//           <div className="total-cost">
//             <strong>Total Cost:</strong> <span>${total_price.toFixed(2)}</span>
//           </div>
//         </div>
//       </div>
//       <div className="section delivery-info">
//         <h2>Delivery Information</h2>
//         <p>{deliveryAddress}</p>
//       </div>
//       <div className="section payment-status">
//         <h2>Payment Status</h2>
//         <p>{paymentStatus}</p>
//       </div>
//       <button onClick={() => navigate("/orders")}>Back to Orders</button>
//     </div>
//   );
// };

// export default OrderConfirmationPage;

// import React, { useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { thunkClearCart } from "../../../store/shoppingCarts";

// import "./OrderConfirmationPage.css";

// const OrderConfirmationPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const createdOrder = useSelector((state) => state.orders?.createdOrder || {});
//   console.log("🚀 ~ file: index.js:12 ~ OrderConfirmationPage ~ createdOrder:", createdOrder)
//   // const menuItemsInfo = useSelector(state => state.shoppingCarts.menuItemsInfo.byId);

//   useEffect(() => {
//     dispatch(thunkClearCart());
//   }, [dispatch]);

//   if (!createdOrder)
//     return <div>No recent order found. Please make an order.</div>;

//   // const { id, totalCost, shippingAddress, paymentStatus } = createdOrder || {};

// const { id, items, total_price, shipping, payment } = createdOrder || {};

// const shippingAddress = shipping ? `${shipping.street_address}, ${shipping.city}, ${shipping.state} ${shipping.postal_code}, ${shipping.country}` : "Shipping information not available";
// const paymentStatus = payment ? payment.status : "Payment status not available";

// console.log("++++++Order Total Price:", total_price);
// console.log("++++++Shipping Address:", shippingAddress);
// console.log("++++++Payment Status:", paymentStatus);

//   return (
//     <div className="order-confirmation-page">

//       <h1>Thank you for your order!</h1>

//       <div className="section order-summary">
//   <h2>Order Summary</h2>
//   <div className="order-details">
//     <div className="order-id">
//       <strong>Order ID:</strong> <span>{id}</span>
//     </div>
//     <div className="items-purchased">
//       <strong>Items Purchased:</strong>
//       <ul>
//         {items?.map((item) => (
//           <li key={item?.menu_item_id} className="item-detail">
//             <span className="item-name">{item?.name}</span>
//             <span className="item-quantity">Qty: {item?.quantity}</span>
//             <span className="item-price">Price: ${item.price?.toFixed(2)}</span>
//           </li>
//         ))}
//       </ul>
//     </div>
//     <div className="total-cost">
//       <strong>Total Cost:</strong> <span>${total_price?.toFixed(2)}</span>
//     </div>
//   </div>
// </div>
//       <div className="section shipping-info">
//         <h2>Shipping Information</h2>
//         <p>{shippingAddress}</p>
//       </div>
//       <div className="section payment-status">
//         <h2>Payment Status</h2>
//         <p>{paymentStatus}</p>
//       </div>

//       <button onClick={() => navigate("/orders")}>Back to Orders</button>
//     </div>
//   );
// };

// export default OrderConfirmationPage;
