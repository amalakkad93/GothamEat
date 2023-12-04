// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { NavLink, useNavigate } from "react-router-dom";
// import { thunkGetPaymentById } from "../../../store/payments";
// import { thunkClearCart } from "../../../store/shoppingCarts";
// import { FaArrowLeft } from "react-icons/fa";

// import "./PaymentForm.css";

// export default function EditPaymentForm({paymentId}) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const payment = useSelector(state => state.payments.byId[paymentId]);
//   const [gateway, setGateway] = useState("Stripe");

//   const [paymentFormData, setPaymentFormData] = useState({
//     cardholder_name: "Anas Alakkad",
//     card_number: "4242424242424242",
//     card_expiry_month: "12",
//     card_expiry_year: "34",
//     card_cvc: "123",
//     postal_code: "91784",
//     // cardholderName: "",
//     // cardNumber: "",
//     // expiryMonth: "",
//     // expiryYear: "",
//     // cvc: "",
//     // postalCode: "",
//   });

//   useEffect(() => {
//     dispatch(thunkGetPaymentById(paymentId));
//   }, [dispatch, paymentId]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPaymentFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();


//   };

//   return (
//     <div className="PaymentForm">
//       <form onSubmit={handleSubmit}>
//         <select value={gateway} onChange={(e) => setGateway(e.target.value)}>
//           <option value="Stripe">Stripe</option>
//           <option value="PayPal">PayPal</option>
//           <option value="Credit Card">Credit Card</option>
//         </select>

//         {gateway === "Credit Card" && (
//           <>
//             <input
//               name="cardholder_name"
//               type="text"
//               value={paymentFormData.cardholder_name}
//               onChange={handleChange}
//               placeholder="Cardholder Name"
//             />
//             <input
//               name="card_number"
//               type="text"
//               value={paymentFormData.card_number}
//               onChange={handleChange}
//               placeholder="Card Number"
//             />
//             <input
//               name="card_expiry_month"
//               type="text"
//               value={paymentFormData.card_expiry_month}
//               onChange={handleChange}
//               placeholder="Expiry Month (MM)"
//             />
//             <input
//               name="card_expiry_year"
//               type="text"
//               value={paymentFormData.card_expiry_year}
//               onChange={handleChange}
//               placeholder="Expiry Year (YYYY)"
//             />
//             <input
//               name="card_cvc"
//               type="text"
//               value={paymentFormData.card_cvc}
//               onChange={handleChange}
//               placeholder="CVC"
//             />
//             <input
//               name="postal_code"
//               type="text"
//               value={paymentFormData.postal_code}
//               onChange={handleChange}
//               placeholder="Postal Code"
//             />
//           </>
//         )}
//         <div className="amounts-div">
//           <p>Subtotal: ${totalAmount?.toFixed(2)}</p>
//           <p>Delivery Fee: ${deliveryCost?.toFixed(2)}</p>
//           <p>Total with Delivery: ${totalWithDeliveryCost?.toFixed(2)}</p>
//         </div>
//         <div className="payment-buttons">
//           <button className="payment-back-btn" type="button" onClick={onBack}>
//           <FaArrowLeft /> Back to Delivery
//           </button>
//           <button className="payment-confirm-btn" type="submit">Confirm Payment</button>
//         </div>
//       </form>
//     </div>
//   );
// }
