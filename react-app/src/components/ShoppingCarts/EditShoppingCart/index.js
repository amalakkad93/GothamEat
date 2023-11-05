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

// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { thunkFetchCurrentCart, thunkUpdateItemInCart } from '../../../store/shoppingCarts';

// const EditShoppingCart = ({ itemId }) => {
//   const dispatch = useDispatch();

//   // Fetch the current state of the cart items from the Redux store
//   // const cartItemsById = useSelector((state) => state.shoppingCart?.items.byId);
//   // const item = cartItemsById ? cartItemsById[itemId] : null;
//   // const [quantity, setQuantity] = useState(item.quantity);
//   const cartItemsById = useSelector((state) => state.shoppingCarts.items.byId);
//   const item = cartItemsById ? cartItemsById[itemId] : undefined;
//   const [quantity, setQuantity] = useState(item?.quantity || 1);


//   useEffect(() => {
//     // Fetch the current cart when the component mounts
//     dispatch(thunkFetchCurrentCart());
//   }, [dispatch]);

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       // Dispatch the thunk and wait for it to finish
//       await dispatch(thunkUpdateItemInCart(itemId, parseInt(quantity, 10)));
//       // Show an alert to notify the user that the cart has been updated
//       alert('Cart updated!');
//     } catch (error) {
//       // If there is an error, you could also show an alert or handle it in another way
//       alert('Failed to update cart. Please try again.');
//     }
//   };
//   // If the item is not in the state, we can't edit it
//   if (!item) {
//     // You might want to handle this case more gracefully in a real app
//     return <p>Item not found in the cart.</p>;
//   }
//   return (
//     <form onSubmit={handleUpdate}>
//       <select value={quantity} onChange={(e) => setQuantity(e.target.value)}>
//         {[...Array(10).keys()].map((num) => (
//           <option key={num + 1} value={num + 1}>
//             {num + 1}
//           </option>
//         ))}
//       </select>
//       {/* <button type="submit">Update</button> */}
//     </form>
//   );
// };

// export default EditShoppingCart;
