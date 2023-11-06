import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import { thunkGetOrderDetails, thunkCancelOrder } from '../../../store/orders';
import { thunkGetPayments } from '../../../store/payments';
import PaymentInfo from '../../Payments/PaymentInfo';
import PaymentForm from '../../Payments/PaymentForm';
import OrderStatusUpdater from '../OrderStatusUpdater';
import CancelOrderButton from '../CancelOredrButton';
import Spinner from '../../Spinner';

const OrderDetail = () => {
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const [orderCancelled, setOrderCancelled] = useState(false);
  const orderDetails = useSelector((state) => state.orders.orders[orderId]);
  const paymentDetails = useSelector((state) => state.payments.payments[orderId]);
  const isLoading = useSelector((state) => state.orders.isLoading);
  const error = useSelector((state) => state.orders.error);

  useEffect(() => {
    if (!orderDetails && !error && !isLoading) {
      dispatch(thunkGetOrderDetails(orderId));
      dispatch(thunkGetPayments(orderId));
    }
  }, [dispatch, orderId, orderDetails, error, isLoading]);

  const handleCancellationSuccess = (action = 'cancel') => {
    if (action === 'rollback') {
      // Rollback UI changes
      setOrderCancelled(false);
    } else {
      // Update UI to show the order is cancelled
      setOrderCancelled(true);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error loading order details: {error}</div>;
  }

  if (!orderDetails) {
    return <div>Loading order details...</div>;
  }

  if (orderCancelled) {
    return <div>This order has been cancelled.</div>;
  }

  return (
    <div>
      <h1>Order Detail</h1>
      <p>Order ID: {orderDetails.id}</p>
      <p>Total Price: ${orderDetails.total_price.toFixed(2)}</p>
      <OrderStatusUpdater orderId={orderId} currentStatus={orderDetails.status} />
      {!orderCancelled && <CancelOrderButton orderId={orderId} onCancellationSuccess={handleCancellationSuccess} />}

      {/* Conditionally render PaymentInfo or PaymentForm based on whether payment details exist */}
      {paymentDetails
        ? <PaymentInfo payment={paymentDetails} />
        : <PaymentForm orderId={orderId} />} {/* Pass the orderId to the PaymentForm for creating a new payment */}
    </div>
  );
};

export default OrderDetail;
