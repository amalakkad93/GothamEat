import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link  } from "react-router-dom";
import { thunkGetOrderDetails, thunkCancelOrder } from '../../../store/orders';
import { thunkGetPayments } from '../../../store/payments';
import { selectOrderDetails, selectOrdersLoading, selectOrdersError } from '../../../store/selectors';
import PaymentInfo from '../../Payments/PaymentInfo';
import PaymentForm from '../../Payments/PaymentForm';
import OrderItemsList from '../OrderItemsList';
import OrderStatusUpdater from '../OrderStatusUpdater';
import CancelOrderButton from '../CancelOredrButton';
import Spinner from '../../Spinner';

const OrderDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderCancelled, setOrderCancelled] = useState(false);
  const orderDetails = useSelector(state => selectOrderDetails(state)(orderId));
  const orderItems = useSelector(state => state.orders.orderItems.byId[orderId] ? state.orders.orderItems.byId[orderId] : []);
  const isLoading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);



  useEffect(() => {
    if (!orderDetails) {
      dispatch(thunkGetOrderDetails(orderId));
    }
  }, [dispatch, orderId, orderDetails]);

  const handleCancelOrder = () => {
    dispatch(thunkCancelOrder(orderId))
      .then(() => {
        setOrderCancelled(true);
      })
      .catch(error => {
        console.error('Failed to cancel order:', error);
      });
  };

  const handleUpdateOrderStatus = (newStatus) => {
    dispatch(thunkUpdateOrderStatus(orderId, newStatus));
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading order details: {error}</p>;
  }

  if (!orderDetails || orderCancelled) {
    return <p>This order has been cancelled or does not exist.</p>;
  }

  return (
    <div className="order-detail-page">
      <h1>Order Details</h1>
      <p><strong>Order ID:</strong> {orderDetails.id}</p>
      <p><strong>Status:</strong> {orderDetails.status}</p>
      <p><strong>Items:</strong></p>
      <ul>
        {orderDetails.items.map(item => (
          <li key={item.id}>{item.name} - Quantity: {item.quantity} - Price: ${item.price}</li>
        ))}
      </ul>
      <p><strong>Total Price:</strong> ${orderDetails.totalPrice}</p>
      <p><strong>Payment Method:</strong> {orderDetails.paymentMethod}</p>
      <p><strong>Transaction ID:</strong> {orderDetails.transactionId}</p>
      <p><strong>Shipping Address:</strong> {orderDetails.shippingAddress}</p>
      <p><strong>Tracking Information:</strong> {orderDetails.trackingInfo}</p>
      <p>If you have any questions or concerns, please contact customer service at support@example.com.</p>
      <button onClick={() => navigate('/orders')}>Back to Orders</button>
      {orderDetails.status !== 'Shipped' && (
        <button onClick={handleCancelOrder}>Cancel Order</button>
      )}
      {orderDetails.status === 'Pending' && (
        <button onClick={() => handleUpdateOrderStatus('Confirmed')}>Confirm Order</button>
      )}
    </div>
  );
};

export default OrderDetail;






// return (
//   <div className="order-detail-container">
//     <h1>Order Detail</h1>
//     <div className="order-summary">
//       <p><strong>Order ID:</strong> {orderDetails.id}</p>
//       <p><strong>Order Date:</strong> {orderDetails.date}</p>
//       <p><strong>Status:</strong> {orderDetails.status}</p>
//       <p><strong>Total Price:</strong> ${orderDetails.total_price.toFixed(2)}</p>
//     </div>

//     {/* {orderDetails.items && <OrderItemsList items={orderDetails.items} />} */}
//     <OrderItemsList items={orderItems} />

//     <div className="payment-information">
//       <h2>Payment Information</h2>
//       {/* Conditionally render PaymentInfo or a button to navigate to PaymentForm */}
//       {orderDetails.payment ? (
//         <PaymentInfo payment={orderDetails.payment} />
//       ) : (
//         <div>
//           <p>No payment has been made for this order.</p>
//           <Link to={`/payment/${orderDetails.id}`} className="btn btn-primary">
//             Proceed to Payment
//           </Link>
//         </div>
//       )}
//     </div>

//     <div className="shipping-information">
//       <h2>Shipping Information</h2>
//       <p><strong>Address:</strong> {orderDetails.shipping_address}</p>
//       <p><strong>Method:</strong> {orderDetails.shipping_method}</p>
//       {/* {orderDetails.tracking_number && (
//         <>
//           <p><strong>Tracking Number:</strong> {orderDetails.tracking_number}</p>
//           <a href={getTrackingUrl(orderDetails.tracking_number)} target="_blank" rel="noopener noreferrer">Track your package</a>
//         </>
//       )} */}
//     </div>

    // <div className="order-management">
    //   <OrderStatusUpdater orderId={orderId} currentStatus={orderDetails.status} />
    //   {!orderCancelled && <CancelOrderButton orderId={orderId} onCancellationSuccess={handleCancellationSuccess} />}
    // </div>

//     <div className="customer-service">
//       <p>Need help? Contact our <a href="mailto:support@yourstore.com">customer service</a>.</p>
//     </div>

//     <button onClick={() => navigate(-1)} className="back-button">Back to Orders</button>
//   </div>
// );
// };

// export default OrderDetail;
