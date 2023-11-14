import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetDeliveries } from '../../../store/deliveries';
import './DeliveryForm.css';

const DeliveryForm = ({ userId, deliveryCost, onNext }) => {
  const dispatch = useDispatch();
  const userDeliveries = useSelector(state =>
    state.delivery.allIds.map(id => state.delivery.byId[id]).filter(delivery => delivery.user_id === userId)
  );

  const [deliveryFormData, setDeliveryFormData] = useState({
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    cost: deliveryCost,
    status: 'Pending',
  });

  useEffect(() => {
    // Fetch shippings only if the user has no shipping data yet
    if (userDeliveries.length === 0) {
      dispatch(thunkGetDeliveries());
    }
    // Set form data only if we have shipping data and formData hasn't been set yet
    if (userDeliveries.length > 0 && !deliveryFormData.id) {
      const latestDelivery = userDeliveries[userDeliveries.length - 1];
      setDeliveryFormData({ ...latestDelivery });
    }
    // Note: We removed `userShippings` from the dependency array to prevent re-running
    // this effect when `userShippings` changes as a result of `setFormData`.
  }, [dispatch, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryFormData(prevData => ({...prevData, [name]: value,}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀🚀🚀🚀🚀🚀🚀 ~ **DeliveryForm file** ~ handleSubmit ~ deliveryFormData:", deliveryFormData)
    onNext({
      street_address: deliveryFormData.street_address,
      city: deliveryFormData.city,
      state: deliveryFormData.state,
      postal_code: deliveryFormData.postal_code,
      country: deliveryFormData.country,
      cost: deliveryCost,
      status: 'Pending',

    });
  };

  return (
    <div className="ShippingForm">
      <form onSubmit={handleSubmit}>
        <h2 className="shipping-header-h1">Shipping Information</h2>
        {/* Render input fields for shipping information */}
        <input name="street_address" value={deliveryFormData.street_address} onChange={handleChange} placeholder="Street Address" className="shipping-input" required />
        <input name="city" value={deliveryFormData.city} onChange={handleChange} placeholder="City" className="shipping-input" required />
        <input name="state" value={deliveryFormData.state} onChange={handleChange} placeholder="State" className="shipping-input" required />
        <input name="postal_code" value={deliveryFormData.postal_code} onChange={handleChange} placeholder="Postal Code" className="shipping-input" required />
        <input name="country" value={deliveryFormData.country} onChange={handleChange} placeholder="Country" className="shipping-input" required />
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default DeliveryForm;
