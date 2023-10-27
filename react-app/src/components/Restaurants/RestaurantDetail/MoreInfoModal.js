import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import mapImage from "../../../assets/mapImage.png";
import "./MoreInfoModal.css";

export default function MoreInfoModal({ restaurant }) {
  return (
    <div className="more-info-modal-content">
      <img className="map-image" src={mapImage} alt="Map" />
      <div className="modal-text-content">
        <h1>{`${restaurant.name}®(${restaurant.street_address})`}</h1>
        <hr className="gray-line" />
        <p>
          <FontAwesomeIcon icon={faMapMarkerAlt} /> {restaurant.street_address},{" "}
          {restaurant.city}, {restaurant.state}, {restaurant.postal_code}
        </p>
        <hr className="gray-line" />
        <p>
          🕒 Operating Hours: {restaurant.opening_time} -{" "}
          {restaurant.closing_time}
        </p>
        <hr className="gray-line" />
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
