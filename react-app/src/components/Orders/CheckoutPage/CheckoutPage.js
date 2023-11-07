
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = ({ cartItems, total, restaurantData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prevState => ({ ...prevState, [name]: value }));
  };

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prevState => ({ ...prevState, [name]: value }));
  };

  const handlePlaceOrder = () => {
    // Validate customer and payment information before dispatching
    dispatch(thunkCreateOrderFromCart(customerInfo, paymentDetails, cartItems, total))
      .then(order => {
        navigate('/order-confirmation', { state: { order } });
      })
      .catch(error => {
        console.error('Error placing the order:', error);
        // Handle error (e.g., show error message to user)
      });
  };

  return (
    <div className='checkout-page'>
      <h2>Checkout</h2>
      <section className='order-summary'>
        <h3>Order Summary</h3>
        <ul>
          {cartItems.map(item => (
            <li key={item.id}>
              {item.name} - Qty: {item.quantity} - Price: ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <strong>Total: ${total.toFixed(2)}</strong>
      </section>
      <section className='customer-information'>
        <h3>Customer Information</h3>
        <input type='text' name='name' placeholder='Full Name' onChange={handleCustomerInfoChange} />
        <input type='text' name='address' placeholder='Shipping Address' onChange={handleCustomerInfoChange} />
        <input type='tel' name='phone' placeholder='Phone Number' onChange={handleCustomerInfoChange} />
        <input type='email' name='email' placeholder='Email Address' onChange={handleCustomerInfoChange} />
      </section>
      <section className='payment-information'>
        <h3>Payment Information</h3>
        <input type='text' name='cardNumber' placeholder='Card Number' onChange={handlePaymentDetailsChange} />
        <input type='text' name='expiryDate' placeholder='Expiry Date (MM/YY)' onChange={handlePaymentDetailsChange} />
        <input type='text' name='cvv' placeholder='CVV' onChange={handlePaymentDetailsChange} />
        <input type='text' name='nameOnCard' placeholder='Name on Card' onChange={handlePaymentDetailsChange} />
      </section>
      <button onClick={handlePlaceOrder}>Place Order</button>
    </div>
  );
};

export default CheckoutPage;
