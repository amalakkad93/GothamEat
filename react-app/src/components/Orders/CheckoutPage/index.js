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

const calculateDeliveryCost = (totalAmount) =>
  (parseFloat(totalAmount) * 0.1).toFixed(2);

const CheckoutPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [deliveryData, setDeliveryData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const userId = useSelector((state) => state.session?.user?.id);
  const cartItems = useSelector(
    (state) => state.shoppingCart?.cartItems?.byId || {}
  );
  const menuItemsDetails = useSelector((state) => state.menuItems.byId);
  const { totalAmount } = location.state || {};
  const deliveryCost = parseFloat(calculateDeliveryCost(totalAmount));
  const totalWithDeliveryCost = parseFloat(
    (totalAmount + deliveryCost).toFixed(2)
  );

  useEffect(() => {
    if (!deliveryData) {
      setCurrentStep(0);
    }
  }, [deliveryData]);

  useEffect(() => {
    if (deliveryData && !paymentData) {
      setCurrentStep(1);
    }
  }, [deliveryData, paymentData]);

  useEffect(() => {
    if (paymentData && deliveryData) {
      createOrder();
    }
  }, [paymentData, deliveryData]);




  const handleDeliverySubmit = async (deliveryFormData) => {
    try {

      const deliveryResponse = await dispatch(
        thunkCreateDelivery(deliveryFormData)
      );
      if (deliveryResponse.error) {
        console.error("Delivery creation error:", deliveryResponse.error);
        alert(
          `Failed to create delivery: ${
            deliveryResponse.error.message || "Unknown error"
          }`
        );
        return;
      }
      setDeliveryData(deliveryResponse.payload);
      setCurrentStep(1);
    } catch (error) {
      console.error("Delivery submission error:", error);
      alert(
        "An unexpected error occurred during delivery creation: " +
          error.message
      );
    }
  };

  const handlePaymentAndOrderCreation = async (paymentFormData) => {
    try {
      const paymentResponse = await dispatch(
        thunkCreatePayment(paymentFormData)
      );
      if (paymentResponse.error) {
        console.error("Payment creation error:", paymentResponse.error);
        alert(
          `Failed to create payment: ${
            paymentResponse.error.message || "Unknown error"
          }`
        );
        return;
      }
      setPaymentData(paymentResponse.payload);
      setCurrentStep(2);
    } catch (error) {
      console.error(
        "An unexpected error occurred while creating the order:",
        error
      );
      alert("An unexpected error occurred: " + error.message);
    }
  };
  const handleGoBackToDelivery = () => {
    setCurrentStep(0);
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

    const orderData = {
      user_id: userId,
      delivery_id: deliveryData.id,
      payment_id: paymentData.id,
      items: detailedItems,
    };
    if (!orderData.user_id) console.error("User ID is missing in the order data.");

    try {
      const orderResponse = await dispatch(thunkCreateOrderFromCart(orderData));
      if (
        orderResponse.ok &&
        orderResponse.payload &&
        orderResponse.payload.order_id
      ) {
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
        alert(
          `Failed to create order: ${
            orderResponse.error.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Order creation error:", error);
      alert(`Failed to create order: ${error.message || "Unknown error"}`);
    }
  };

  if (!userId) console.error("User ID is undefined. Ensure the user is logged in.");
  return (
    <div className="checkout-container">
      <Stepper steps={["Delivery", "Payment"]} currentStep={currentStep} />
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
          onBack={handleGoBackToDelivery}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
