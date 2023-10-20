// NearbyRestaurants.js
import React from 'react';
import { useSelector } from 'react-redux';

export default function NearbyRestaurants() {
    const nearbyRestaurants = useSelector(state => state.restaurants.nearby);

    return (
        <div>
            {/* <h2>Nearby Restaurants</h2> */}
            <ul>
                {nearbyRestaurants.map(restaurant => (
                    <li key={restaurant.google_place_id}>
                        <img src={restaurant.banner_image_path} alt="Restaurant Icon" width="40" />
                        <h3>{restaurant.name}</h3>
                        {/* <p>Status: {restaurant.business_status}</p> */}
                        {restaurant.permanently_closed && <p>This restaurant is permanently closed.</p>}
                        <p>Address: {restaurant.street_address}</p>
                        {/* Assuming rating is a float, you can format it to display one decimal */}
                        <p>Rating: {restaurant.average_rating} ({restaurant.user_ratings_total} ratings)</p>
                        {/* {restaurant.photos && restaurant.photos.length > 0 &&
                            <img src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=AIzaSyD9K3yiocDK8m9toC_sYxpLF366qfnlWtQ`} alt="Restaurant Banner" />
                        } */}
                        {/* Other restaurant details can be added here */}
                    </li>
                ))}
            </ul>
        </div>
    );
}



// // frontend/src/components/RestaurantList.js
// import React from 'react';
// import { useSelector } from 'react-redux';

// function RestaurantList() {
//     const nearbyRestaurants = useSelector(state => state.restaurants.nearby);

//     return (
//         <div className="restaurant-list">
//             {nearbyRestaurants.map(restaurant => (
//                 <div key={restaurant.place_id} className="restaurant-item">
//                     <img src={restaurant.icon} alt={restaurant.name} />
//                     <h3>{restaurant.name}</h3>
//                     <p>Status: {restaurant.business_status}</p>
//                 </div>
//             ))}
//         </div>
//     );
// }

// export default RestaurantList;
