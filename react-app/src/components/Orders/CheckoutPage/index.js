import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { thunkCreateOrderFromCart } from '../../../store/orders';
import { thunkCreateDelivery } from '../../../store/deliveries';
import { thunkCreatePayment } from '../../../store/payments';
import OrderSummary from '../OrderSummary';
import DeliveryForm from '../../Delivery/DeliveryForm';
import PaymentForm from '../../Payments/PaymentForm';

import './CheckoutPage.css';

const calculateDeliveryCost = (totalAmount) => (parseFloat(totalAmount) * 0.1).toFixed(2);

const CheckoutPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [deliveryData, setDeliveryData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const userId = useSelector(state => state.session?.user?.id);
  const cart = useSelector(state => state.shoppingCart);
  // const cartItems = useSelector(state => state.shoppingCart.items);

  const { cartItems, totalAmount, restaurantData } = location.state || {};

  const totalAmountNumber = parseFloat(totalAmount);
   const deliveryCost = parseFloat(calculateDeliveryCost(totalAmountNumber));

  const totalWithDeliveryCost = parseFloat((totalAmountNumber + deliveryCost).toFixed(2));


  const handleDeliverySubmit = (deliveryFormData) => {
    setDeliveryData({
      ...deliveryFormData,
      user_id: userId,
      cost: deliveryCost,
      status: 'Pending'
    });
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (paymentFormData) => {
    setPaymentData({
      ...paymentFormData,
      amount: totalWithDeliveryCost,
      status: 'Pending'
    });
    setCurrentStep(3);
  };

  const handleOrderCreation = async () => {
    try {
      // Create Delivery
      const deliveryResponse = await dispatch(thunkCreateDelivery(deliveryData));
      if (deliveryResponse.error) {
        console.error("Delivery creation error:", deliveryResponse.error);
        alert(`Failed to create delivery: ${deliveryResponse.error.message || "Unknown error"}`);
        return;
      }
      const deliveryId = deliveryResponse.payload.id;

      // Create Payment
      const paymentResponse = await dispatch(thunkCreatePayment(paymentData));
      if (paymentResponse.error) {
        console.error("Payment creation error:", paymentResponse.error);
        alert(`Failed to create payment: ${paymentResponse.error.message || "Unknown error"}`);
        return;
      }
      const paymentId = paymentResponse.payload.id;

      // Create Order
      const orderData = {
        user_id: userId,
        delivery_id: deliveryId,
        payment_id: paymentId,
        items: cartItems
      };

      const orderResponse = await dispatch(thunkCreateOrderFromCart(orderData));
      if (orderResponse.error) {
        console.error("Order creation error:", orderResponse.error);
        alert(`Failed to create order: ${orderResponse.error.message || "Unknown error"}`);
        return;
      }

      navigate(`/order-confirmation/${orderResponse.payload.id}`);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      alert("An unexpected error occurred: " + error.message);
    }
  };


  return (
    <div className="checkout-container">
      {currentStep === 1 && (
        <DeliveryForm
          onNext={handleDeliverySubmit}
        />
      )}
      {currentStep === 2 && (
        <PaymentForm
          onNext={handlePaymentSubmit}
        />
      )}
      {currentStep === 3 && (
        <div>
          <button onClick={handleOrderCreation}>Confirm Order</button>
        </div>
      )}
      {/* other JSX components */}
    </div>
  );
};

export default CheckoutPage;
