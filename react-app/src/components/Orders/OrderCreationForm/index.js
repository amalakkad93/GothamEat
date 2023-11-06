// import React from 'react';
// import { useDispatch } from 'react-redux';
// import { thunkCreateOrderFromCart } from '../../../store/orders';

// const OrderCreationForm = () => {
//   const dispatch = useDispatch();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await dispatch(thunkCreateOrderFromCart());
//     // Additional logic after order creation
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <button type="submit">Create Order</button>
//     </form>
//   );
// };

// export default OrderCreationForm;
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { thunkCreateOrder } from '../../../store/orders'; // Import the action from your actions file

const CreateOrderForm = ({ userId }) => {
  const dispatch = useDispatch();
  const [totalPrice, setTotalPrice] = useState('');
  const [cartItems, setCartItems] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(thunkCreateOrder(userId, totalPrice, cartItems));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Total Price:
        <input
          type="number"
          value={totalPrice}
          onChange={e => setTotalPrice(e.target.value)}
        />
      </label>
      {/* Include inputs for cart items and other order details */}
      <button type="submit">Create Order</button>
    </form>
  );
};

export default CreateOrderForm;
