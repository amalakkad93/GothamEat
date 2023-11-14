import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { thunkCreatePayment } from "../../../store/payments";
import { thunkCreateOrderFromCart } from "../../../store/orders";
import { thunkClearCart } from "../../../store/shoppingCarts";
import "./PaymentForm.css";

function PaymentForm({
  orderId,
  totalWithShipping,
  shippingCost,
  totalAmountNumber,
  onNext
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [gateway, setGateway] = useState("Stripe");
  const [cardDetails, setCardDetails] = useState({
    cardholderName: "Anas Alakkad",
    cardNumber: "'4242424242424242",
    expiryMonth: "12",
    expiryYear: "34",
    cvc: "123",
    postalCode: "91784",
    // cardholderName: "",
    // cardNumber: "",
    // expiryMonth: "",
    // expiryYear: "",
    // cvc: "",
    // postalCode: "",
  });

  const {
    cardholderName,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvc,
    postalCode,
  } = cardDetails;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paymentData = {
      orderId,
      gateway,
      amount: totalWithShipping,
      cardholderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc,
      postalCode,
    };


    try {
      const paymentActionResult = await dispatch(thunkCreatePayment(paymentData));
      console.log("++--Payment action result:", paymentActionResult);
      if (!paymentActionResult) {
        throw new Error("Payment creation failed: No result returned");
      }
      if (paymentActionResult.error) {
        throw new Error("++--Payment failed: " + paymentActionResult.error);
      }

      const orderActionResult = await dispatch(thunkCreateOrderFromCart());
      console.log("Order action result:", orderActionResult);
      if (!orderActionResult) {
        throw new Error("Order creation failed: No result returned");
      }
      if (orderActionResult.error) {
        throw new Error("Order creation failed: " + orderActionResult.error);
      }

      if (orderActionResult.id) {
        navigate(`/order-confirmation/${orderActionResult.id}`);
      } else {
        console.error("Unexpected order action result:", orderActionResult);
        throw new Error("Order creation failed: Unexpected payload structure");
      }
    } catch (error) {
      console.error("Error during payment or order creation:", error);
      alert("An error occurred while processing your order. Please try again.");
    }
  };;

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
              value={cardholderName}
              onChange={handleChange}
              placeholder="Cardholder Name"
              autocomplete="cc-number"
            />
            <input
              type="text"
              value={cardNumber}
              onChange={handleChange}
              placeholder="Card Number"
              autocomplete="cc-number"
            />
            <input
              type="text"
              value={expiryMonth}
              onChange={handleChange}
              placeholder="Expiry Month (MM)"
              autocomplete="cc-number"
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
