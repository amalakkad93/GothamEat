import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetOrderDetails } from '../../../store/orders';

const OrderSummary = ({ orderId }) => {
  const dispatch = useDispatch();
  const order = useSelector((state) => state.orders.byId[orderId]);
  const orderItems = useSelector((state) =>
    order?.orderItems.map((itemId) => state.orderItems.byId[itemId])
  );

  if (!order) {
    return <div>Loading order details...</div>;
  }

  return (
    <div>
      <h2>Order Summary for Order #{orderId}</h2>
      <ul>
        {orderItems?.map((item) => (
          <li key={item.id}>
            {item.menu_item.name} - Quantity: {item.quantity}
          </li>
        ))}
      </ul>
      <p>Total Price: ${order.total_price.toFixed(2)}</p>
      <p>Status: {order.status}</p>
    </div>
  );
};

export default OrderSummary;
