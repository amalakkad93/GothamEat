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


  // Render the form based on the current step
  return (
    <div className="checkout-container">
      {orderId ? (
        <OrderSummary orderId={orderId} />
      ) : (
        <>
          {currentStep === 1 && (
            <div className="shipping-header">
              <ShippingForm userId={userId} shippingCost={shippingCost} orderId={orderId} onNext={goToPaymentStep} />
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
