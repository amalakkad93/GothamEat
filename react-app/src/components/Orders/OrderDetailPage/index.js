import React, { useEffect, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  thunkGetOrderDetails,
  thunkCancelOrder,
  thunkUpdateOrderStatus,
} from "../../../store/orders";
import CancelOrderButton from "../CancelOrderButton";
import DeleteOrder from "../DeleteOrder";
import OpenModalButton from "../../Modals/OpenModalButton";
import {
  FaShippingFast,
  FaCreditCard,
  FaBoxOpen,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaRegClock,
} from "react-icons/fa";

import { calculateTax } from "../../../assets/helpers/helpers";

import "./OrderDetailPage.css";

const OrderDetailPage = ({ orderIdProp }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId: orderIdFromUrl } = useParams();
  const orderId = orderIdProp || orderIdFromUrl;
  // Access the state properties
  const order = useSelector((state) => state.orders.orders.byId[orderId]);
  const orderItems = useSelector((state) => state.orders.orderItems.byId);
  const menuItems = useSelector((state) => state.orders.menuItems.byId);
  const isLoading = useSelector((state) => state.orders.isLoading);
  const error = useSelector((state) => state.orders.error);

  const deliveryId = order?.delivery_id;
  const deliveryDetails = useSelector(
    (state) => state.delivery?.byId[deliveryId]
  );

  const deliveryCost = deliveryDetails?.cost || 0;

  const orderAndDeliverySubtotal =
    parseFloat(order?.total_price) + parseFloat(order?.delivery?.cost);
  const orderTaxAmount = calculateTax(orderAndDeliverySubtotal);
  const totalWithTax = orderAndDeliverySubtotal + orderTaxAmount;
  const formattedFinalTotal = totalWithTax?.toFixed(2);

  useEffect(() => {
    dispatch(thunkGetOrderDetails(orderId));
  }, [dispatch, orderId]);

  // const handleCancelOrder = async () => {
  //   try {
  //     await dispatch(thunkCancelOrder(orderId));
  //     navigate("/orders");
  //   } catch (err) {
  //     alert('Error canceling order: ' + err.message);
  //   }
  // };

  if (isLoading) return <p>Loading order details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!order) return <p>Order details not found.</p>;

  // Assuming each orderItem has a menu_item_id property
  const itemsList = Object.values(orderItems)
    .filter((item) => item.order_id === order.id)
    .map((item) => {
      const menuItem = menuItems[item.menu_item_id];
      return {
        ...item,
        name: menuItem?.name,
        price: menuItem?.price,
      };
    });

  return (
    <div className="order-detail-page">
      <div className="order-header">
        <h1>Order #{order.id}</h1>
        <p className="order-date">
          {new Date(order.date).toLocaleDateString()}
        </p>
        <p className={`order-status ${order.status.toLowerCase()}`}>
          {order.status}
        </p>
      </div>

      <div className="order-body">
        <div className="order-items">
          {itemsList.map((item, index) => (
            <div className="item-card" key={index}>
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price?.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="additional-info">
          <div className="delivery-info">
            <h3>
              <FaMapMarkerAlt /> Delivery Information
            </h3>
            <p>
              Address: {order.delivery?.street_address}, {order.delivery?.city},{" "}
              {order.delivery?.state}, {order.delivery?.country}
            </p>
            <p>Postal Code: {order.delivery?.postal_code}</p>
            <p>Tracking Number: {order.delivery?.tracking_number}</p>
          </div>

          <div className="payment-info">
            <h3>
              <FaCreditCard /> Payment Details
            </h3>
            <p>Method: {order.payment?.gateway}</p>
            <p>Transaction ID: {order.payment?.id}</p>
          </div>
        </div>
        <div className="order-summary">
          <h2>Order Summary</h2>
          <p>Subtotal: ${order.total_price.toFixed(2)}</p>
          <p>Tax: ${orderTaxAmount.toFixed(2)}</p>
          <p>
            Delivery Fee: ${parseFloat(order.delivery?.cost || 0).toFixed(2)}
          </p>
          <h3>Total: ${formattedFinalTotal}</h3>
        </div>
      </div>

      <div className="order-footer">
        <button className="back-button" onClick={() => navigate("/orders")}>
          <FaArrowLeft /> Back to Orders
        </button>
        {order.status === "Pending" && (
          <OpenModalButton
            className="cancel-button"
            buttonText="Cancel Order"
            modalComponent={<CancelOrderButton orderId={order.id} className="cancel-button" />}
          />
        )}
        {order.status === "Cancelled" && (
          <OpenModalButton
            className="cancel-button"
            buttonText="Delete Order"
            modalComponent={<DeleteOrder orderId={order.id} className="cancel-button" />}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
//   return (
//     <div className="order-detail-page">
//       <div className="container">
//         <header className="header card">
//           <h1 className="section-title">
//             <FaBoxOpen className="icon" /> Order Details - #{order.id}
//           </h1>
//         </header>

//         <div className="order-status card">
//           <p>
//             Status:{" "}
//             <span className={`status ${order.status.toLowerCase()}`}>
//               {order.status}
//             </span>
//           </p>
//         </div>

//         <div className="order-items card">
//           {itemsList.map((item, index) => (
//             <div className="item-card" key={index}>
//               <h3>{item.name}</h3>
//               <p>Quantity: {item.quantity}</p>
//               <p>Price: ${item.price?.toFixed(2)}</p>
//             </div>
//           ))}
//         </div>

//         <div className="order-summary card">
//           <h2>Total: ${order.total_price?.toFixed(2)}</h2>
//         </div>

//         <div className="additional-info card">
//           <div className="shipping-info">
//             <h3>
//               <FaShippingFast className="icon" /> Delivery Information
//             </h3>
//             <p>
//               Address: {order.delivery?.street_address}, {order.delivery?.city},{" "}
//               {order.delivery?.state}, {order.delivery?.country}
//             </p>
//             <p>Postal Code: {order.delivery?.postal_code}</p>
//             <p>Tracking Number: {order.delivery?.tracking_number}</p>
//           </div>

//           <div className="payment-info animated-card">
//             <h3>
//               <FaCreditCard className="icon" /> Payment Details
//             </h3>
//             <p>Method: {order.payment?.gateway}</p>
//             <p>Transaction ID: {order.payment?.id}</p>
//           </div>
//         </div>

//         <div className="order-actions card">
// {order.status === "Pending" && (
//   <CancelOrderButton orderId={order.id} className="cancel-button" />
// )}
//           <button className="back-button" onClick={() => navigate("/orders")}>
//             <FaArrowLeft className="icon" /> Back to Orders
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetailPage;

//   return (
//     <div className="order-detail-container modern-layout">
//       <div className="order-header animated-header">
//         <h1 className="order-title">Order Details</h1>
//         <div className="order-info">
//           <span className="order-id">ID: {order.id}</span> |
//           <span className="order-status">{order.status}</span>
//         </div>
//       </div>

//       <div className="items-container">
//         {itemsList.map((item, index) => (
//           <div className="item-card modern-card" key={index}>
//             <div className="item-name">{item.name}</div>
//             <div className="item-details">
//               <span>Qty: {item.quantity}</span>
//               <span>Price: ${item.price?.toFixed(2)}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="order-summary">
//         <div className="total-price">Total: ${order.total_price?.toFixed(2)}</div>
//       </div>

//       <div className="additional-info modern-card">
//         <div className="shipping-info">
//           <h3>Shipping Information</h3>
// <p>{order.delivery?.street_address}, {order.delivery?.city}, {order.delivery?.state}, {order.delivery?.country}</p>
// <p>Postal Code: {order.delivery?.postal_code}</p>
// <p>Tracking Number: {order.delivery?.tracking_number}</p>
//         </div>

//         <div className="payment-info">
//           <h3>Payment Details</h3>
// <p>Method: {order.payment?.gateway}</p>
// <p>Transaction ID: {order.payment?.id}</p>
//         </div>
//       </div>

//       <div className="customer-service modern-card">
//         <h3>Customer Service</h3>
//         <p>Contact us at support@example.com</p>
//       </div>

//       <div className="order-actions animated-actions">
//         {order.status === "Pending" && (
//           <CancelOrderButton orderId={order.id} className="cancel-button modern-button" />
//         )}
//         <button className="back-button modern-button" onClick={() => navigate("/orders")}>Back to Orders</button>
//       </div>
//     </div>
//   );
// };

// export default OrderDetailPage;
