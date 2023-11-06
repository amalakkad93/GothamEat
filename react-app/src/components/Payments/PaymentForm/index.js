import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { thunkCreatePayment, thunkEditPayment } from '../../../store/payments';

function PaymentForm({ payment }) {
  const [orderId, setOrderId] = useState(payment?.order_id || '');
  const [gateway, setGateway] = useState(payment?.gateway || '');
  const [amount, setAmount] = useState(payment?.amount || '');
  const [status, setStatus] = useState(payment?.status || '');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    const paymentData = { orderId, gateway, amount, status };

    if (payment) {
      dispatch(thunkEditPayment(payment.id, paymentData));
    } else {
      dispatch(thunkCreatePayment(paymentData));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields here */}
      <input
        type="text"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Order ID"
      />
      <input
        type="text"
        value={gateway}
        onChange={(e) => setGateway(e.target.value)}
        placeholder="Gateway"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <input
        type="text"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        placeholder="Status"
      />
      <button type="submit">{payment ? 'Update' : 'Add'}</button>
    </form>
  );
}

export default PaymentForm;
