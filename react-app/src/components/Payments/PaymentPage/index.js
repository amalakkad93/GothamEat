import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import  CreatePaymentForm from '../../Payments/PaymentForm/CreatePaymentForm';
import { selectOrderDetails } from '../../../store/selectors';

const PaymentPage = () => {
  const { orderId } = useParams();
  const orderDetails = useSelector(state => selectOrderDetails(state)(orderId));

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Complete Your Payment</h1>
      < CreatePaymentForm orderId={orderId} totalAmount={orderDetails.total_price} />
    </div>
  );
};

export default PaymentPage;
