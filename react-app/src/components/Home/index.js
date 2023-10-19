import React from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar";
import './home.css';
import { useDispatch } from 'react-redux';
import { thunkGetNearbyRestaurants } from '../../store/restaurants';
import NearbyRestaurants from '../Restaurants/GetNearbyRestaurants'

export default function Home() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function handlePlaceSelected(place) {
        console.log(place.geometry.location.toString());

        // Fetch the nearby restaurants based on the selected place's latitude and longitude
        const { lat, lng } = place.geometry.location;
        dispatch(thunkGetNearbyRestaurants(lat(), lng()));  // Dispatch the thunk with the latitude and longitude

        navigate('/nearby');
    }

    return (
        <>
            <SearchBar onPlaceSelected={handlePlaceSelected} />
            {/* <NearbyRestaurants /> */}
        </>
    );
}
