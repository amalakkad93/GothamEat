import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { thunkCreateOrderFromCart } from '../../../store/orders';
import OrderSummary from '../OrderSummary';
import DeliveryForm from '../../Delivery/DeliveryForm';
import PaymentForm from '../../Payments/PaymentForm';

import './CheckoutPage.css';

const calculateShippingCost = (totalAmount) => {

  const cost = parseFloat(totalAmount) * 0.1;
  return cost.toFixed(2);
};
const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderId, setOrderId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const userId = useSelector(state => state.session?.user?.id);
  const cart = useSelector(state => state.shoppingCart);

  // const cartItems = cart?.items || [];
  // const totalAmount = location.state?.totalAmount || 0;
  const goToPaymentStep = () => setCurrentStep(2);
  const goToShippingStep = () => setCurrentStep(1);
  const { cartItems, totalAmount, restaurantData } = location.state || {};

  const totalAmountNumber = parseFloat(totalAmount);
   const shippingCost = parseFloat(calculateShippingCost(totalAmountNumber));

  const totalWithShipping = parseFloat((totalAmountNumber + shippingCost).toFixed(2));


  // Render the form based on the current step
  return (
    <div className="checkout-container">
      {orderId ? (
        <OrderSummary orderId={orderId} />
      ) : (
        <>
          {currentStep === 1 && (
            <div className="shipping-header">
              <DeliveryForm userId={userId} shippingCost={shippingCost} orderId={orderId} onNext={goToPaymentStep} />
              <div className="button-container">
                {/* <button onClick={goToPaymentStep} className="next-button">Next</button> */}
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="payment-header">
              <PaymentForm totalWithShipping={totalWithShipping} shippingCost={shippingCost} totalAmountNumber={totalAmountNumber} />
              <div className="button-container">
                <button onClick={goToShippingStep} className="previous-button">
                  Previous
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CheckoutPage;



// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { thunkCreateOrderFromCart } from '../../../store/orders';
// import { thunkCreateDelivery } from '../../../store/deliveries';
// import { thunkCreatePayment } from '../../../store/payments';
// import OrderSummary from '../OrderSummary';
// import DeliveryForm from '../../Delivery/DeliveryForm';
// import PaymentForm from '../../Payments/PaymentForm';

// import './CheckoutPage.css';

// const calculateDeliveryCost = (totalAmount) => (parseFloat(totalAmount) * 0.1).toFixed(2);

// const CheckoutPage = () => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [currentStep, setCurrentStep] = useState(1);

//   const [deliveryData, setDeliveryData] = useState(null);
//   const [paymentData, setPaymentData] = useState(null);

//   const userId = useSelector(state => state.session?.user?.id);
//   const cart = useSelector(state => state.shoppingCart);
//   // const cartItems = useSelector(state => state.shoppingCart.items);

//   const { cartItems, totalAmount, restaurantData } = location.state || {};

//   const totalAmountNumber = parseFloat(totalAmount);
//    const deliveryCost = parseFloat(calculateDeliveryCost(totalAmountNumber));

//   const totalWithDeliveryCost = parseFloat((totalAmountNumber + deliveryCost).toFixed(2));


//   const handleDeliverySubmit = (deliveryFormData) => {
//     setDeliveryData({
//       ...deliveryFormData,
//       user_id: userId,
//       cost: deliveryCost,
//       status: 'Pending'
//     });
//     setCurrentStep(2);
//   };

//   const handlePaymentSubmit = (paymentFormData) => {
//     setPaymentData({
//       ...paymentFormData,
//       amount: totalWithDeliveryCost,
//       status: 'Pending'
//     });
//     setCurrentStep(3);
//   };

//   const handleOrderCreation = async () => {
//     try {
//       // Create Delivery
//       const deliveryResponse = await dispatch(thunkCreateDelivery(deliveryData));
//       console.log("🚀 ~ file: index.js:60 ~ handleOrderCreation ~ deliveryResponse :", deliveryResponse )
//       if (deliveryResponse.error) {
//         console.error("Delivery creation error:", deliveryResponse.error);
//         alert(`Failed to create delivery: ${deliveryResponse.error.message || "Unknown error"}`);
//         return;
//       }
//       const deliveryId = deliveryResponse.payload.id;
//       console.log("🚀 ~ file: index.js:66 ~ handleOrderCreation ~ deliveryId :", deliveryId )

//       // Create Payment
//       console.log("🚀 ~ file: index.js:69 ~ handleOrderCreation ~ paymentData:", paymentData)
//       const paymentResponse = await dispatch(thunkCreatePayment(paymentData));
//       console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ file: index.js:84 ~ handleOrderCreation ~  paymentResponse.payload.data.id:",  paymentResponse.payload.data.id)
//       // if (!paymentResponse.ok || !paymentResponse.payload.data.id) {
//       //   alert("Failed to create payment.");
//       //   return;
//       // }
//       console.log("🚀 ~ file: index.js:69 ~ handleOrderCreation ~ paymentResponse:", paymentResponse)
//       if (paymentResponse.error) {
//         console.error("Payment creation error:", paymentResponse.error);
//         alert(`Failed to create payment: ${paymentResponse.error.message || "Unknown error"}`);
//         return;
//       }

//       const paymentId = paymentResponse.payload.data.id;
//       console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ file: index.js:77 ~ handleOrderCreation ~ paymentId:", paymentId)

//       // Create Order
//       const orderData = {
//         user_id: userId,
//         delivery_id: deliveryId,
//         payment_id: paymentId,
//         items: cartItems
//       };

//       const orderResponse = await dispatch(thunkCreateOrderFromCart(orderData));
//       if (orderResponse.error) {
//         console.error("Order creation error:", orderResponse.error);
//         alert(`Failed to create order: ${orderResponse.error.message || "Unknown error"}`);
//         return;
//       }

//       navigate(`/order-confirmation/${orderResponse.payload.id}`);
//     } catch (error) {
//       console.error("An unexpected error occurred:", error);
//       alert("An unexpected error occurred: " + error.message);
//     }
//   };


//   return (
//     <div className="checkout-container">
//       {currentStep === 1 && (
//         <DeliveryForm
//           onNext={handleDeliverySubmit}
//         />
//       )}
//       {currentStep === 2 && (
//         <PaymentForm
//           onNext={handlePaymentSubmit}
//         />
//       )}
//       {currentStep === 3 && (
//         <div>
//           <button onClick={handleOrderCreation}>Confirm Order</button>
//         </div>
//       )}
//       {/* other JSX components */}
//     </div>
//   );
// };

// export default CheckoutPage;
