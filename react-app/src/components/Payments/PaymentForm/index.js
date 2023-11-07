import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkCreatePayment } from "../../../store/payments";
import "./PaymentForm.css";

function PaymentForm({
  orderId,
  totalWithShipping,
  shippingCost,
  totalAmountNumber,
}) {
  const dispatch = useDispatch();
  const [gateway, setGateway] = useState("Stripe");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    postalCode: "",
  });

  const { cardNumber, expiryMonth, expiryYear, cvc, postalCode } = cardDetails;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const paymentData = {
      orderId,
      gateway,
      amount: totalWithShipping,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc,
      postalCode,
    };

    dispatch(thunkCreatePayment(paymentData));
  };

  return (
    <div className="PaymentForm">
      <form onSubmit={handleSubmit}>
        <select value={gateway} onChange={(e) => setGateway(e.target.value)}>
          <option value="Stripe">Stripe</option>
          <option value="PayPal">PayPal</option>
          <option value="Credit Card">Credit Card</option>
        </select>

        {gateway === "Credit Card" && (
          <>
            <input
              type="text"
              value={cardNumber}
              onChange={handleChange}
              placeholder="Card Number"
            />
            <input
              type="text"
              value={expiryMonth}
              onChange={handleChange}
              placeholder="Expiry Month (MM)"
            />
            <input
              type="text"
              value={expiryYear}
              onChange={handleChange}
              placeholder="Expiry Year (YYYY)"
            />
            <input
              type="text"
              value={cvc}
              onChange={handleChange}
              placeholder="CVC"
            />
            <input
              type="text"
              value={postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
            />
          </>
        )}
        <div className="amounts-div">
          <p>Subtotal: ${totalAmountNumber?.toFixed(2)}</p>
          <p>Delivery Fee: ${shippingCost?.toFixed(2)}</p>
          <p>Total with Delivery: ${totalWithShipping?.toFixed(2)}</p>
        </div>

        <button type="submit">Confirm Payment</button>
      </form>
    </div>
  );
}

export default PaymentForm;
