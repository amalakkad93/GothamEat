/**
 * MoreInfoModal Component
 *
 * This component renders a modal that provides additional details about a specific restaurant.
 * It displays a map image, restaurant address, operating hours, and rating details.
 * The visual representation is enhanced with icons for better user experience.
 */

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import mapImage from "../../../assets/mapImage.png";
import "./MoreInfoModal.css";

export default function MoreInfoModal({ restaurant }) {
  // Render the modal content
  return (
    <div className="more-info-modal-content">
      {/* Display a map image to give a geographical context */}
      <img
        className="map-image"
        src={mapImage}
        alt="Map representation of the restaurant's location"
      />

      <div className="modal-text-content">
        {/* Display the restaurant name and street address as a header */}
        <h1>{`${restaurant.name}® (${restaurant.street_address})`}</h1>
        <hr className="gray-line" />

        {/* Address section with icon */}
        <p>
          <FontAwesomeIcon icon={faMapMarkerAlt} /> {restaurant.street_address},
          {restaurant.city}, {restaurant.state}, {restaurant.postal_code}
        </p>
        <hr className="gray-line" />

        {/* Operating hours section with clock icon */}
        <p>
          🕒 Operating Hours: {restaurant.opening_time} -{" "}
          {restaurant.closing_time}
        </p>
        <hr className="gray-line" />

        {/* Rating and reviews section */}
        <p>
          ★ {restaurant.average_rating}
          {` (${restaurant.num_reviews}${
            restaurant.num_reviews === 1 ? " review" : " reviews"
          })`}
        </p>
      </div>
    </div>
  );
}
