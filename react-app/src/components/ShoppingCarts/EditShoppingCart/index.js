import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkUpdateItemInCart } from '../../../store/shoppingCarts';

const EditShoppingCart = ({ itemId }) => {
  const dispatch = useDispatch();
  const cartItemsById = useSelector((state) => state.shoppingCarts.items.byId);
  const item = cartItemsById ? cartItemsById[itemId] : undefined;
  const [quantity, setQuantity] = useState(item?.quantity || 1);

  const handleQuantityChange = async (newQuantity) => {
    setQuantity(newQuantity); // Update local state
    try {
      // Dispatch the thunk immediately with the new quantity
      await dispatch(thunkUpdateItemInCart(itemId, parseInt(newQuantity, 10)));
      // Optionally show a message or update the UI to indicate success
    } catch (error) {
      // Handle error
      alert('Failed to update cart. Please try again.');
    }
  };

  // If the item is not in the state, we can't edit it
  if (!item) {
    return <p>Item not found in the cart.</p>;
  }

  return (
    <div>
      <select value={quantity} onChange={(e) => handleQuantityChange(e.target.value)}>
        {[...Array(10).keys()].map((num) => (
          <option key={num + 1} value={num + 1}>
            {num + 1}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EditShoppingCart;
