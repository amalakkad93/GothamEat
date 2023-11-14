import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { calculateTax } from "../../../assets/helpers/helpers";
import ConfirmationBanner from "../../../assets/conformation_page_banner.jpg";

import './OrderConfirmationPage.css'
const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const { order, delivery, payment } = location.state;
  console.log("🚀 ~ file: index.js:12 ~ OrderConfirmationPage ~ order:", order)

  const orderAndDeliverySubtotal = parseFloat(order.total_price?.toFixed(2)) + parseFloat(delivery?.cost);
  const orderTaxAmount = calculateTax(orderAndDeliverySubtotal);
  const totalWithTax = orderAndDeliverySubtotal + orderTaxAmount;
  const formattedFinalTotal = totalWithTax?.toFixed(2);

  console.log("type of subtotal", typeof subtotal)
  console.log("type of tax", typeof tax)
  console.log("type of finalTotal", typeof finalTotal)

  return (
    <div className="order-confirmation-page">
      <h1>Thank you for your order!</h1>
      <img src={ConfirmationBanner} alt="Order Success" className="confirmation-illustration" />

      <p className="personalized-message">We're preparing your items and will send them out soon.</p>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <p>Order ID: {order.order_id}</p>
        <ul>
          {order.items.map(item => (
            <li key={item.menu_item_id}>
              {item.name} - Qty: {item.quantity} - Price: ${item.price?.toFixed(2)}
            </li>
          ))}
        </ul>
        <p>Subtotal: ${order.total_price?.toFixed(2)}</p>
        <p>Tax: ${orderTaxAmount?.toFixed(2)}</p>
        <p>Delivery Fee: ${delivery?.cost}</p>
        <h3>Total: ${formattedFinalTotal}</h3>
      </div>

      <div className="delivery-info">
        <h2>Delivery Information</h2>
        <p>Address: {delivery.street_address}, {delivery.city}, {delivery.state}, {delivery.country}</p>
        <p>Postal Code: {delivery.postal_code}</p>
      </div>

      <div className="payment-status">
        <h2>Payment Status</h2>
        <p>Gateway: {payment.gateway}</p>
        <p>Status: {order.status}</p>
      </div>

      <button className="order-confirmation-btn" onClick={() => navigate(`/orders/${order.order_id}`)}>View Order Details</button>
    </div>
  );
};

export default OrderConfirmationPage;
