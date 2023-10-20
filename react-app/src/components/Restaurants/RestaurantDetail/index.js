// components/RestaurantDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { thunkGetRestaurantDetails } from '../../../store/restaurants';

export default function RestaurantDetail() {
    const { restaurantId } = useParams();
    const dispatch = useDispatch();
    const restaurant = useSelector(state => state.restaurants.singleRestaurant);

    useEffect(() => {
        dispatch(thunkGetRestaurantDetails(restaurantId));
    }, [dispatch, restaurantId]);

    // Display restaurant details
    return (
        <div>
            <h1>{restaurant.name}</h1>
            {/* Display other restaurant details here */}
        </div>
    );
}
