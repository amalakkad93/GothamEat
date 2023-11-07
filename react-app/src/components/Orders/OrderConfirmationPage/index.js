
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const order = useSelector(state => state.orders.lastCreatedOrder); // Replace with your actual state slice
  const paymentStatus = order.paymentStatus; // Replace with your actual payment status state slice

  // Function to navigate back to the orders list
  const handleBackToOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="order-confirmation-page">
      <h1>Thank you for your order!</h1>
      <div className="order-summary">
        <h2>Order Summary</h2>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Items Purchased:</strong></p>
        <ul>
          {order.items.map(item => (
            <li key={item.id}>{item.name} - Quantity: {item.quantity} - Price: ${item.price}</li>
          ))}
        </ul>
        <p><strong>Total Cost:</strong> ${order.totalCost}</p>
        <p><strong>Shipping Information:</strong> {order.shippingAddress}</p>
      </div>
      <div className="payment-status">
        <h2>Payment Status</h2>
        <p>{paymentStatus}</p>
      </div>
      <div className="next-steps">
        <h2>Next Steps</h2>
        <p>You will receive an email confirmation shortly with your order details.</p>
        <p>If you selected a tracked shipping method, you will receive another email with your tracking information once your order has been shipped.</p>
      </div>
      <button onClick={handleBackToOrders}>Back to Orders</button>
    </div>
  );
};

export default OrderConfirmationPage;
