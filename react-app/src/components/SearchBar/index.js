import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import { getKey } from "../../store/maps";
import "./SearchBar.css";

function SearchBar({ onPlaceSelected }) {
  const dispatch = useDispatch();
  const searchBoxRef = useRef(null);
  const apiKey = useSelector((state) => state.maps.key);

  useEffect(() => {
    dispatch(getKey());
  }, [dispatch]);

  const onPlacesChanged = () => {
    if (!searchBoxRef.current) {
      console.error("SearchBox ref is not available");
      return;
    }

    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      onPlaceSelected(place);
    } else {
      console.error("No places found");
    }
  };

  return apiKey ? (
    <LoadScript googleMapsApiKey={apiKey} libraries={["places"]}>
      <StandaloneSearchBox
        onLoad={(ref) => {
          console.log("onLoad called with ref:", ref);
          searchBoxRef.current = ref;
        }}
        onPlacesChanged={onPlacesChanged}
      >
        <input
          type="text"
          className="search-input"
          placeholder="Search for a restaurant location..."
        />
      </StandaloneSearchBox>
    </LoadScript>
  ) : null; // Render nothing if the API key is not yet loaded
}

export default SearchBar;
