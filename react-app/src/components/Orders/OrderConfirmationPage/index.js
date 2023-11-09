import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkClearCart } from "../../../store/shoppingCarts";

import "./OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const createdOrder = useSelector((state) => state.orders?.createdOrder || {});
  // const menuItemsInfo = useSelector(state => state.shoppingCarts.menuItemsInfo.byId);

  useEffect(() => {
    dispatch(thunkClearCart());
  }, [dispatch]);

  if (!createdOrder)
    return <div>No recent order found. Please make an order.</div>;

  // const { id, totalCost, shippingAddress, paymentStatus } = createdOrder || {};

const { id, items, total_price, shipping, payment } = createdOrder || {};


const shippingAddress = shipping ? `${shipping.street_address}, ${shipping.city}, ${shipping.state} ${shipping.postal_code}, ${shipping.country}` : "Shipping information not available";
const paymentStatus = payment ? payment.status : "Payment status not available";

console.log("++++++Order Total Price:", total_price);
console.log("++++++Shipping Address:", shippingAddress);
console.log("++++++Payment Status:", paymentStatus);


  return (
    <div className="order-confirmation-page">

      <h1>Thank you for your order!</h1>

      <div className="section order-summary">
  <h2>Order Summary</h2>
  <div className="order-details">
    <div className="order-id">
      <strong>Order ID:</strong> <span>{id}</span>
    </div>
    <div className="items-purchased">
      <strong>Items Purchased:</strong>
      <ul>
        {items?.map((item) => (
          <li key={item?.menu_item_id} className="item-detail">
            <span className="item-name">{item?.name}</span>
            <span className="item-quantity">Qty: {item?.quantity}</span>
            <span className="item-price">Price: ${item.price?.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="total-cost">
      <strong>Total Cost:</strong> <span>${total_price?.toFixed(2)}</span>
    </div>
  </div>
</div>
      <div className="section shipping-info">
        <h2>Shipping Information</h2>
        <p>{shippingAddress}</p>
      </div>
      <div className="section payment-status">
        <h2>Payment Status</h2>
        <p>{paymentStatus}</p>
      </div>

      <button onClick={() => navigate("/orders")}>Back to Orders</button>
    </div>
  );
};

export default OrderConfirmationPage;
