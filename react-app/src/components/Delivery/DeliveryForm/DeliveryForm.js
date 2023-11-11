import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkCreateDelivery,
  thunkUpdateDelivery,
  thunkGetDeliveries,
} from "../../../store/deliveries";

import './DeliveryForm.css';

const DeliveryForm =  ({ userId, orderId, deliveryCost, onNext }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    cost: deliveryCost,
    status: "Pending",
    shipped_at: null,
    estimated_delivery: null,
  });

  const userDeliveries = useSelector((state) =>
    state.delivery.allIds
      .map((id) => state.delivery.byId[id])
      .filter((delivery) => delivery.user_id === userId)
  );

  // useEffect(() => {
  //   if (!userShippings.length) {
  //     dispatch(thunkFetchShippings());
  //   } else if (userShippings.length > 0 && !formData.id) {
  //     const latestShipping = userShippings[userShippings.length - 1];
  //     setFormData({ ...latestShipping });
  //   }
  // }, [userId, userShippings, dispatch]);
  useEffect(() => {
    // Fetch shippings only if the user has no shipping data yet
    if (userDeliveries.length === 0) {
      dispatch(thunkGetDeliveries());
    }
    // Set form data only if we have shipping data and formData hasn't been set yet
    if (userDeliveries.length > 0 && !formData.id) {
      const latestDelivery = userDeliveries[userDeliveries.length - 1];
      setFormData({ ...latestDelivery });
    }
    // Note: We removed `userShippings` from the dependency array to prevent re-running
    // this effect when `userShippings` changes as a result of `setFormData`.
  }, [dispatch, userId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('~~~~~handleSubmit called with formData', formData);
    // Dispatch the thunk to create or update shipping information
    if (orderId) {
      // If we have an orderId, it means we're confirming shipping for an existing order
      dispatch(
        thunkUpdateDelivery(formData.id, { ...formData, order_id: orderId })
      );
    } else {
      console.log('~~~~~Dispatching thunkCreateDelivery');
      // If there's no orderId, we're creating new shipping info
      dispatch(thunkCreateDelivery({ ...formData, user_id: userId }));
    }

    onNext();
  };

  return (
    <div className="ShippingForm">
    <form onSubmit={handleSubmit}>
      <h2 className="shipping-header-h1">Shipping Information</h2>
      {/* Render input fields for shipping information */}
      <input
        name="street_address"
        value={formData.street_address}
        onChange={handleChange}
        placeholder="Street Address"
        className="shipping-input"
        required
      />
      <input
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="City"
        className="shipping-input"
        required
      />
      <input
        name="state"
        value={formData.state}
        onChange={handleChange}
        placeholder="State"
        className="shipping-input"
        required
      />
      <input
        name="postal_code"
        value={formData.postal_code}
        onChange={handleChange}
        placeholder="Postal Code"
        className="shipping-input"
        required
      />
      <input
        name="country"
        value={formData.country}
        onChange={handleChange}
        placeholder="Country"
        className="shipping-input"
        required
      />
      {/* <input
        name="cost"
        type="number"
        min="0.00"
        step="0.01"
        value={formData.cost}
        className="shipping-input"
        readOnly
      /> */}

      <button type="submit">Next</button>
    </form>
    </div>
  );
};

export default DeliveryForm;
