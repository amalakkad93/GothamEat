import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetUserOrders, thunkCancelOrder, thunkReorderPastOrder } from '../../../store/orders';
import OrderDetails from '../OrderDetail';
import CancelButton from '../CancelButton';

const OrderList = ({ userId }) => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(thunkGetUserOrders(userId));
  }, [dispatch, userId]);

  const handleCancelOrder = (orderId) => {
    dispatch(thunkCancelOrder(orderId));
  };

  const handleReorder = (orderId) => {
    dispatch(thunkReorderPastOrder(orderId));
  };

  if (!orders) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      {Object.values(orders).map((order) => (
        <div key={order.id}>
          <h2>Order #{order.id}</h2>
          <button onClick={() => handleReorder(order.id)}>Reorder</button>
          <OrderDetails orderId={order.id} />
          <CancelButton orderId={order.id} />
          {/* Add more details and actions as needed */}
        </div>
      ))}
    </div>
  );
};

export default OrderList;
