import React from 'react';

const OrderItemsList = ({ items }) => {
  return (
    <div className="order-items-list">
      <h2>Items in Your Order</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="order-item">
            <img src={item.thumbnail} alt={item.name} className="order-item-image" />
            <div className="order-item-info">
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price.toFixed(2)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderItemsList;
