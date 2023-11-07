import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { thunkGetOrderDetails, thunkCancelOrder } from "../../../store/orders";
import { thunkGetPayments } from "../../../store/payments";
import {
  selectOrderDetails,
  selectOrdersLoading,
  selectOrdersError,
} from "../../../store/selectors";
import PaymentInfo from "../../Payments/PaymentInfo";
import PaymentForm from "../../Payments/PaymentForm";
import OrderItemsList from "../OrderItemsList";
import OrderStatusUpdater from "../OrderStatusUpdater";
import CancelOrderButton from "../CancelOredrButton";
import Spinner from "../../Spinner";

const OrderDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [orderCancelled, setOrderCancelled] = useState(false);
  const orderDetails = useSelector((state) =>
    selectOrderDetails(state)(orderId)
  );
  const orderItems = useSelector((state) =>
    state.orders.orderItems.byId[orderId]
      ? state.orders.orderItems.byId[orderId]
      : []
  );
  const isLoading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);

  const canCancel = ["Pending", "Confirmed"].includes(orderDetails?.status);

  useEffect(() => {
    if (!orderDetails && !error && !isLoading) {
      dispatch(thunkGetOrderDetails(orderId));
      // dispatch(thunkGetPayments());
    }
  }, [dispatch, orderId, orderDetails, error, isLoading]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error loading order details: {error}</div>;
  }

  if (!orderDetails || orderCancelled) {
    return <div>{orderCancelled ? "This order has been cancelled." : "Loading order details..."}</div>;
  }

  return (
    <div className="order-detail-page">
      <h1>Order Details</h1>
      <p>
        <strong>Order ID:</strong> {orderDetails.id}
      </p>
      <p>
        <strong>Status:</strong> {orderDetails.status}
      </p>
      <OrderItemsList items={orderItems} />
      <p>
        <strong>Total Price:</strong> ${orderDetails.totalPrice}
      </p>
      {/* {payments && payments.map(payment => (
        <PaymentInfo key={payment.id} payment={payment} />
      ))} */}
      <p>
        <strong>Shipping Address:</strong> {orderDetails.shippingAddress}
      </p>
      <p>
        <strong>Tracking Information:</strong> {orderDetails.trackingInfo}
      </p>
      <p>
        If you have any questions or concerns, please contact customer service
        at support@example.com.
      </p>
      <button onClick={() => navigate("/orders")}>Back to Orders</button>

      <div className="order-management">
        {/* Only show CancelOrderButton if canCancel is true and the order hasn't been cancelled */}
        {canCancel && !orderCancelled && (

          <CancelOrderButton orderId={orderId} />

        )}
        {/* Additional buttons for updating order status can be added here */}
      </div>

      <OrderStatusUpdater
        orderId={orderId}
        currentStatus={orderDetails.status}
      />
    </div>
  );
};
export default OrderDetail;
