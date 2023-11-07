import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { thunkCreateOrderFromCart } from '../../../store/orders';
import OrderSummary from '../OrderSummary';
import ShippingForm from '../../Shipping/ShippingForm';
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

  const handlePlaceOrder = async () => {
    try {
      const actionResult = await dispatch(thunkCreateOrderFromCart());
      if (actionResult.meta.requestStatus === 'fulfilled') {
        setOrderId(actionResult.payload.id);
        navigate(`/order-confirmation/${actionResult.payload.id}`);
      } else {
        throw new Error('Failed to create order from cart.');
      }
    } catch (error) {
      alert('There was an error placing your order. Please try again.');
      console.error('Order placement error:', error);
    }
  };
  // const handlePlaceOrder = async () => {
  //   if (!cartItems.length) {
  //     alert('Your cart is empty.');
  //     return;
  //   }

  //   try {
  //     const actionResult = await dispatch(thunkCreateOrderFromCart());
  //     console.log('Action Result:', actionResult);
  //     if (actionResult.meta.requestStatus === 'fulfilled') {
  //       // Set the orderId state with the new order ID from the action payload
  //       setOrderId(actionResult.payload.id);
  //       // Navigate to the order confirmation page
  //       navigate(`/order-confirmation/${actionResult.payload.id}`);
  //     } else {
  //       throw new Error('Failed to create order from cart.');
  //     }
  //   } catch (error) {
  //     alert('There was an error placing your order. Please try again.');
  //     console.error('Order placement error:', error);
  //   }
  // };


  // Render the form based on the current step
  return (
    <div className="checkout-container">
      {orderId ? (
        <OrderSummary orderId={orderId} />
      ) : (
        <>
          {currentStep === 1 && (
            <div className="shipping-header">
              <ShippingForm userId={userId} shippingCost={shippingCost} orderId={orderId} />
              <div className="button-container">
                <button onClick={goToPaymentStep} className="next-button">
                  Next
                </button>
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
                <button onClick={handlePlaceOrder} className="place-order-button">
                  Place Order
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
