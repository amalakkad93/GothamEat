import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkRemovePayment } from './store/payments';
import DeletePaymentButton from '../DeletePaymentButton';


function PaymentDetail({ payment }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(thunkRemovePayment(payment.id));
  };

  return (
    <div>
      <h3>{`Payment ID: ${payment.id}`}</h3>
      <p>{`Order ID: ${payment.order_id}`}</p>
      <p>{`Amount: ${payment.amount}`}</p>
      <p>{`Gateway: ${payment.gateway}`}</p>
      <p>{`Status: ${payment.status}`}</p>
      <DeletePaymentButton onDelete={handleDelete} />
    </div>
  );
}

export default PaymentDetail;
