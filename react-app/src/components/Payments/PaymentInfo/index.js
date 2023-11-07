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

      {/* If the user needs a receipt, you could add a button or link to view/download the receipt */}
      {payment.status === 'Completed' && (
        <button onClick={() => {/* logic to view/download receipt */}}>
          View Receipt
        </button>
      )}

      {/* If refunds are allowed and the payment is refundable, provide an option to initiate a refund */}
      {/* This should only be displayed based on business rules */}
      {payment.status === 'Completed' && /* additional refund eligibility checks */ (
        <button onClick={() => {/* logic to initiate a refund */}}>
          Refund Payment
        </button>
      )}

      {/* More actions can be added here based on the application's requirements */}

    </div>
  );
};

export default PaymentInfo;

