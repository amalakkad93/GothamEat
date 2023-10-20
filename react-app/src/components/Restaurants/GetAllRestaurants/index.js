import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { thunkGetAllRestaurants } from '../../../store/restaurants';

export default function Restaurants() {
    const dispatch = useDispatch();
    const restaurants = useSelector(state => state.restaurants.allRestaurants);

    useEffect(() => {
        dispatch(thunkGetAllRestaurants());
    }, [dispatch]);

    return (
        <div>
            {restaurants.map(restaurant => (
                <div key={restaurant.id}>
                    <h2>{restaurant.name}</h2>
                </div>
            ))}
        </div>
    );
}
