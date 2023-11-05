import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetOrderDetails } from '../../../store/orders';
import OrderStatusUpdater from '../OrderStatusUpdater';

const OrderDetail = ({ orderId }) => {
  const dispatch = useDispatch();
  const orderDetails = useSelector((state) => state.orderDetails[orderId]);

  useEffect(() => {
    dispatch(thunkGetOrderDetails(orderId));
  }, [dispatch, orderId]);

  if (!orderDetails) {
    return <div>Loading order details...</div>;
  }

  return (
    <div>
      <h1>Order Detail</h1>
      {/* Display order details */}
      <p>Order ID: {orderDetails.id}</p>
      <p>Total Price: ${orderDetails.total_price}</p>
      <OrderStatusUpdater orderId={orderId} currentStatus={order?.status} />
      {/* Add more details as needed */}
    </div>
  );
};

export default OrderDetail;
