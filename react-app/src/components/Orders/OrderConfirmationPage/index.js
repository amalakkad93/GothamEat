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
  const { id, items, total_price, shippingAddress, paymentStatus } =
    createdOrder || {};

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
      {/* <div className="section next-steps">
        <h2>Next Steps</h2>
        <p>
          You will receive an email confirmation shortly with your order
          details.
        </p>
        <p>
          If you selected a tracked shipping method, you will receive another
          email with your tracking information once your order has been shipped.
        </p>
      </div> */}
      <button onClick={() => navigate("/orders")}>Back to Orders</button>
    </div>
  );
};

export default OrderConfirmationPage;
