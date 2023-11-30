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
  const order = useSelector((state) => state.orders.orders.byId[orderId]);
  const orderItems = useSelector((state) => state.orders.orderItems.byId);
  const menuItems = useSelector((state) => state.orders.menuItems.byId);
  const currentUserId = useSelector((state) => state.session.user?.id);
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
  const isCurrentUserOrder = order?.user_id === currentUserId;
  if (isLoading) return <p>Loading order details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!order) return <p>Order details not found.</p>;

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

    if (!isCurrentUserOrder) return <p>You do not have permission to view this order.</p>;

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
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {itemsList.map((item, index) => (
              <div className="item-card" key={index}>
                <div className="item-name">{item.name}</div>
                <div className="item-quantity-price">
                  <span>Qty: {item.quantity}</span>
                  <span>${item.price?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-costs">
            <div className="cost-item">
              <span>Subtotal:</span>
              <span>${order.total_price.toFixed(2)}</span>
            </div>
            <div className="cost-item">
              <span>Tax:</span>
              <span>${orderTaxAmount.toFixed(2)}</span>
            </div>
            <div className="cost-item">
              <span>Delivery Fee:</span>
              <span>${parseFloat(order.delivery?.cost || 0).toFixed(2)}</span>
            </div>
            <div className="total-cost">
              <strong>Total:</strong>
              <strong>${formattedFinalTotal}</strong>
            </div>
          </div>
        </div>

        <div className="additional-info">
          <div className="delivery-info">
            <h3>
              <FaMapMarkerAlt /> Delivery Information
            </h3>
            <div className="info-detail">
              <strong>Address:</strong>
              <p>
                {order.delivery?.street_address}, {order.delivery?.city},{" "}
                {order.delivery?.state}, {order.delivery?.country}
              </p>
            </div>
            <div className="info-detail">
              <strong>Postal Code:</strong>
              <p>{order.delivery?.postal_code}</p>
            </div>
            <div className="info-detail">
              <strong>Tracking Number:</strong>
              <p>{order.delivery?.tracking_number}</p>
            </div>
          </div>

          <div className="payment-info">
            <h3>
              <FaCreditCard /> Payment Details
            </h3>
            <div className="info-detail">
              <strong>Method:</strong>
              <p>{order.payment?.gateway}</p>
            </div>
            <div className="info-detail">
              <strong>Transaction ID:</strong>
              <p>{order.payment?.id}</p>
            </div>
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
              modalComponent={
                <CancelOrderButton
                  orderId={order.id}
                  className="cancel-button"
                />
              }
            />
          )}
          {order.status === "Cancelled" && (
            <OpenModalButton
              className="cancel-button"
              buttonText="Delete Order"
              modalComponent={
                <DeleteOrder orderId={order.id} className="cancel-button" />
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
