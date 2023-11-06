import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetPayments } from './../../../store/payments';
import PaymentDetail from '../PaymentDetail';
import PaymentForm from '../PaymentForm';

function PaymentList() {
  const dispatch = useDispatch();
  const payments = useSelector(state => state.payments.payments);

  useEffect(() => {
    dispatch(thunkGetPayments());
  }, [dispatch]);

  return (
    <div>
      <PaymentForm />
      {Object.values(payments).map(payment => (
        <PaymentDetail key={payment.id} payment={payment} />
      ))}
    </div>
  );
}

export default PaymentList;
