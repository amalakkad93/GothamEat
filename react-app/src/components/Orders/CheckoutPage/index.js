import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { thunkCreateOrderFromCart } from "../../../store/orders";
import { thunkCreateDelivery } from "../../../store/deliveries";
import { thunkCreatePayment } from "../../../store/payments";
import { thunkClearCart } from "../../../store/shoppingCarts";

import DeliveryForm from "../../Delivery/DeliveryForm";
import PaymentForm from "../../Payments/PaymentForm";
import Stepper from "../../Stepper";

import "./CheckoutPage.css";

const calculateDeliveryCost = (totalAmount) => (parseFloat(totalAmount) * 0.1).toFixed(2);

const CheckoutPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [deliveryData, setDeliveryData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const userId = useSelector((state) => state.session?.user?.id);
  const cartItems = useSelector((state) => state.shoppingCart?.cartItems?.byId || {});
  const menuItemsDetails = useSelector((state) => state.menuItems.byId);
  console.log("🚀🚀 ~ file: index.js:32 ~ menuItemsDetails:", menuItemsDetails);
  console.log("🚀🚀 ~ file: index.js:28 ~ cartItems:", cartItems);

  const { totalAmount } = location.state || {};
  const deliveryCost = parseFloat(calculateDeliveryCost(totalAmount));
  const totalWithDeliveryCost = parseFloat((totalAmount + deliveryCost).toFixed(2));



  const handleDeliverySubmit = async (deliveryFormData) => {
    try {
      // Create delivery and store its response
      const deliveryResponse = await dispatch(thunkCreateDelivery(deliveryFormData));
      if (deliveryResponse.error) {
        console.error("Delivery creation error:", deliveryResponse.error);
        alert(`Failed to create delivery: ${deliveryResponse.error.message || "Unknown error"}`);
        return;
      }
      setDeliveryData(deliveryResponse.payload); // Store the delivery data
      setCurrentStep(2); // Proceed to the next step
    } catch (error) {
      console.error("Delivery submission error:", error);
      alert("An unexpected error occurred during delivery creation: " + error.message);
    }
  };

  useEffect(() => {
    // Assuming the paymentData and deliveryData determine the step
    if (deliveryData && !paymentData) {
      setCurrentStep(1); // Move to Payment step
    }
  }, [deliveryData, paymentData]);

useEffect(() => {
  // Check if both payment and delivery data are available
  if (paymentData && deliveryData) {
    createOrder();
  }
}, [paymentData, deliveryData]); // Watch for changes in paymentData and deliveryData

const handlePaymentAndOrderCreation = async (paymentFormData) => {
  try {
    const paymentResponse = await dispatch(thunkCreatePayment(paymentFormData));
    if (paymentResponse.error) {
      console.error("Payment creation error:", paymentResponse.error);
      alert(`Failed to create payment: ${paymentResponse.error.message || "Unknown error"}`);
      return;
    }

    // Update paymentData state
    setPaymentData(paymentResponse.payload); // Store the payment data
    // No need to call createOrder here; useEffect will handle it
  } catch (error) {
    console.error("An unexpected error occurred while creating the order:", error);
    alert("An unexpected error occurred: " + error.message);
  }
};

const createOrder = async () => {
  if (!deliveryData || !paymentData) {
    console.error("Delivery or payment data is missing.");
    alert("Cannot create order without delivery and payment information.");
    return;
  }


  const detailedItems = Object.values(cartItems).map((item) => ({
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    name: menuItemsDetails[item.menu_item_id]?.name,
    price: menuItemsDetails[item.menu_item_id]?.price,
  }));
  console.log("🚀 ~ file: index.js:128 ~ detailedItems ~ detailedItems:", detailedItems)

  const orderData = {
    user_id: userId,
    delivery_id: deliveryData.id, // Use delivery ID from deliveryData
    payment_id: paymentData.id, // Use payment ID from paymentData
    items: detailedItems,
  };

  try {
    const orderResponse = await dispatch(thunkCreateOrderFromCart(orderData));
    if (orderResponse.ok && orderResponse.payload && orderResponse.payload.order_id) {
      navigate(`/order-confirmation`, {
        state: {
          order: orderResponse.payload,
          delivery: deliveryData,
          payment: paymentData,
          cartItems: detailedItems,
        },
      });
      await dispatch(thunkClearCart());
    } else {
      console.error("Order creation error:", orderResponse.error);
      alert(`Failed to create order: ${orderResponse.error.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Order creation error:", error);
    alert(`Failed to create order: ${error.message || "Unknown error"}`);
  }
};


  return (
    <div className="checkout-container">
       <Stepper steps={['Delivery', 'Payment']} currentStep={currentStep} />
      {currentStep === 0 && (
        <DeliveryForm
          userId={userId}
          deliveryCost={deliveryCost}
          onNext={handleDeliverySubmit}
        />
      )}
      {currentStep === 1 && (
        <PaymentForm
          totalWithDeliveryCost={totalWithDeliveryCost}
          deliveryCost={deliveryCost}
          totalAmount={totalAmount}
          // onPaymentSubmit={handlePaymentSubmit}
          // onOrderCreation={handleOrderCreation}
          // onSubmit={onPaymentFormSubmit}
          onSubmit={handlePaymentAndOrderCreation}
        />
      )}
      {/* {currentStep === 3 && (
        <div>
          <button onClick={handleOrderCreation}>Confirm Order</button>
        </div>
      )} */}
    </div>
  );
};

export default CheckoutPage;


// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";

// import { thunkCreateOrderFromCart } from "../../../store/orders";
// import { thunkCreateDelivery } from "../../../store/deliveries";
// import { thunkCreatePayment } from "../../../store/payments";
// import { thunkClearCart } from "../../../store/shoppingCarts";

// import DeliveryForm from "../../Delivery/DeliveryForm";
// import PaymentForm from "../../Payments/PaymentForm";

// import "./CheckoutPage.css";

// const calculateDeliveryCost = (totalAmount) =>
//   (parseFloat(totalAmount) * 0.1).toFixed(2);

// const CheckoutPage = () => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [currentStep, setCurrentStep] = useState(1);
//   const [deliveryData, setDeliveryData] = useState(null);
//   const [paymentData, setPaymentData] = useState(null);

//   const userId = useSelector((state) => state.session?.user?.id);
//   const cartItems = useSelector(
//     (state) => state.shoppingCart?.cartItems?.byId || {}
//   );
//   const menuItemsDetails = useSelector((state) => state.menuItems.byId);
//   console.log("🚀🚀 ~ file: index.js:32 ~ menuItemsDetails:", menuItemsDetails);
//   console.log("🚀🚀 ~ file: index.js:28 ~ cartItems:", cartItems);

//   const { totalAmount } = location.state || {};

//   const deliveryCost = parseFloat(calculateDeliveryCost(totalAmount));

//   const totalWithDeliveryCost = parseFloat(
//     (totalAmount + deliveryCost).toFixed(2)
//   );

//   const handleDeliverySubmit = (deliveryFormData) => {
//     setDeliveryData({
//       ...deliveryFormData,
//       user_id: userId,
//       cost: deliveryCost,
//       status: "Pending",
//     });
//     setCurrentStep(2);
//   };

//   const handlePaymentSubmit = (paymentFormData) => {
//     setPaymentData({
//       ...paymentFormData,
//       amount: totalWithDeliveryCost,
//       status: "Pending",
//     });
//     setCurrentStep(3);
//   };

//   const handleOrderCreation = async () => {
//     try {
//       // Create Delivery
//       const deliveryResponse = await dispatch(
//         thunkCreateDelivery(deliveryData)
//       );
//       if (deliveryResponse.error) {
//         console.error("Delivery creation error:", deliveryResponse.error);
//         alert(
//           `Failed to create delivery: ${
//             deliveryResponse.error.message || "Unknown error"
//           }`
//         );
//         return;
//       }
//       const deliveryId = deliveryResponse.payload.id;

//       // Create Payment
//       const paymentResponse = await dispatch(thunkCreatePayment(paymentData));
//       if (paymentResponse.error) {
//         console.error("Payment creation error:", paymentResponse.error);
//         alert(
//           `Failed to create payment: ${
//             paymentResponse.error.message || "Unknown error"
//           }`
//         );
//         return;
//       }
//       const paymentId = paymentResponse.payload.id;

//        // Prepare detailed order items for the order creation
//     const detailedItems = Object.values(cartItems).map((item) => ({
//       menu_item_id: item.menu_item_id,
//       quantity: item.quantity,
//       name: menuItemsDetails[item.menu_item_id]?.name,
//       price: menuItemsDetails[item.menu_item_id]?.price,
//     }));
//     console.log("🚀 ~ file: index.js:99 ~ detailedItems ~ detailedItems:", detailedItems)

//     // Create Order
//     const orderData = {
//       user_id: userId,
//       delivery_id: deliveryId,
//       payment_id: paymentId,
//       items: detailedItems,
//     };

//     // Dispatch the order creation thunk
//     const orderResponse = await dispatch(thunkCreateOrderFromCart(orderData));

//     console.log("++++Order response:", orderResponse);
//     console.log("++++Navigating with state:", {
//       order: orderResponse.payload,
//       delivery: deliveryData,
//       payment: paymentData,
//       cartItems: detailedItems,
//     });

//     if (
//       orderResponse.ok &&
//       orderResponse.payload &&
//       orderResponse.payload.order_id
//     ) {
//       navigate(`/order-confirmation`, {
//         state: {
//           order: orderResponse.payload,
//           delivery: deliveryData,
//           payment: paymentData,
//           cartItems: detailedItems, // Use detailedItems instead of orderItemsWithDetails
//         },
//       });

//       // Clear the cart after successful navigation
//       await dispatch(thunkClearCart());
//       } else {
//         console.error("Order creation error:", orderResponse.error);
//         alert(
//           `Failed to create order: ${
//             orderResponse.error.message || "Unknown error"
//           }`
//         );
//       }
//     } catch (error) {
//       console.error("An unexpected error occurred:", error);
//       alert("An unexpected error occurred: " + error.message);
//     }
//   };

//   return (
//     <div className="checkout-container">
//       {currentStep === 1 && (
//         <DeliveryForm
//           userId={userId}
//           deliveryCost={deliveryCost}
//           onNext={handleDeliverySubmit}
//         />
//       )}
//       {currentStep === 2 && (
//         <PaymentForm
//           totalWithDeliveryCost={totalWithDeliveryCost}
//           deliveryCost={deliveryCost}
//           totalAmount={totalAmount}
//           onSubmit={handlePaymentSubmit}
//           // onSubmit={handleOrderCreation}
//         />
//       )}
//       {currentStep === 3 && (
//         <div>
//           <button onClick={handleOrderCreation}>Confirm Order</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CheckoutPage;
