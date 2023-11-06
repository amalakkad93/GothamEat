import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkEditPayment } from '../../../store/payments';

const PaymentInfo = ({ payment }) => {
  const dispatch = useDispatch();

  // Function to handle the payment update, for example, marking as completed
  const handleUpdatePaymentStatus = (newStatus) => {
    const paymentData = { ...payment, status: newStatus };
    dispatch(thunkEditPayment(payment.id, paymentData));
  };

  // You can add more interactivity and features, such as editing the payment method, refunding, etc.
  return (
    <div>
      <h2>Payment Information</h2>
      <p>Payment ID: {payment.id}</p>
      <p>Order ID: {payment.order_id}</p>
      <p>Payment Gateway: {payment.gateway}</p>
      <p>Amount: ${payment.amount.toFixed(2)}</p>
      <p>Status: {payment.status}</p>

      {/* You might have a button to update the status, for example: */}
      {payment.status !== 'Completed' && (
        <button onClick={() => handleUpdatePaymentStatus('Completed')}>
          Mark as Completed
        </button>
      )}

      {/* If you have more statuses, you can add more buttons or a dropdown to select the status */}
    </div>
  );
};

export default PaymentInfo;
