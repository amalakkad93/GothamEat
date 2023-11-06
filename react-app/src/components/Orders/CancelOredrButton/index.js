import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { thunkCancelOrder } from '../../../store/orders';
import { thunkClearCart } from '../../../store/shoppingCarts';

const CancelOrderButton = ({ orderId, onCancellationSuccess }) => {
  const dispatch = useDispatch();

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        // Attempt to cancel the order
        await dispatch(thunkCancelOrder(orderId));
        // If successful, clear the cart
        dispatch(thunkClearCart()); // Add this line
        // Call the success callback
        onCancellationSuccess();
        toast.success('Order has been cancelled.');
      } catch (error) {
        // If there's an error, handle rollback
        onCancellationSuccess('rollback');
        toast.error('Failed to cancel order: ' + (error.message || error));
      }
    }
  };


  return <button onClick={handleCancel}>Cancel Order</button>;
};

export default CancelOrderButton;
