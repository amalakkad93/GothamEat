import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar";
import './home.css';
import { useDispatch } from 'react-redux';
import { thunkGetNearbyRestaurants }  from '../../store/restaurants';

// The Home component represents the main page of our application.
// It allows users to search for nearby restaurants either by manually entering a location or using their current location.
// This component makes use of various React hooks and Redux to manage state and perform actions.

export default function Home() {
    // Initialize essential hooks and variables.
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedLocation, setSelectedLocation] = useState(null);

    // handlePlaceSelected function is called when a location is selected from the search bar.
    // It extracts location details and triggers navigation to the nearby restaurants page.
    const handlePlaceSelected = (place) => {
        // Extract latitude and longitude from the selected place.
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Check if place.address_components is defined before accessing it.
        const cityComponent = place.address_components?.find(component => component.types.includes("locality"));
        const stateComponent = place.address_components?.find(component => component.types.includes("administrative_area_level_1"));
        const countryComponent = place.address_components?.find(component => component.types.includes("country"));

        // Extract location details (city, state, country) if the components are defined.
        const city = cityComponent?.long_name;
        const state = stateComponent?.long_name;
        const country = countryComponent?.long_name;

        // Update the selectedLocation state with the extracted details.
        setSelectedLocation({ lat, lng, city, state, country });

        // Navigate to the nearby restaurants page for the selected location.
        navigate('/restaurants/nearby');
    }

    // useCurrentLocation function is called when the "Use My Location" button is clicked.
    // It retrieves the user's current geolocation and triggers navigation to the nearby restaurants page.
    const useCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            // Extract latitude and longitude from the geolocation position.
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Update the selectedLocation state with the user's current location.
            setSelectedLocation({ latitude, longitude });

            // Navigate to the nearby restaurants page using the current location.
            navigate('/restaurants/nearby');
        });
    }

    // Render the main page content, including the search bar and "Use My Location" button.
    return (
        <>
            <h1 className="Search-bar-title">Order delivery near you</h1>
            <SearchBar onPlaceSelected={handlePlaceSelected} />
            <button onClick={useCurrentLocation}>Use My Location</button>
        </>
    );
}

