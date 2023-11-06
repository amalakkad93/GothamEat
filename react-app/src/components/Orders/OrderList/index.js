import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetUserOrders } from '../../../store/orders';
import OrderDetail from '../OrderDetail';
import CancelOrderButton from '../CancelOredrButton';

const OrderList = ({ userId }) => {
  const dispatch = useDispatch();
  const orders = useSelector(state => Object.values(state.orders.orders));
  const error = useSelector(state => state.orders.error);

  useEffect(() => {
    if (!orders.length && !error) {
      dispatch(thunkGetUserOrders(userId));
    }
  }, [dispatch, userId, orders, error]);

  if (error) {
    return <div>Error loading orders: {error}</div>;
  }

  if (!orders.length) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      {orders.map((order) => (
        <div key={order.id}>
          <h2>Order #{order.id}</h2>
          <OrderDetail orderId={order.id} />
          <CancelOrderButton orderId={order.id} />
        </div>
      ))}
    </div>
  );
};

export default OrderList;
