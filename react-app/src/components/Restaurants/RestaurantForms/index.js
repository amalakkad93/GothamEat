import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
// import { navigate } from "@reach/router";

import FormContainer from "../../CustomTags/FormContainer";
import {
  thunkCreateRestaurant,
  thunkUpdateRestaurant,
  thunkGetRestaurantDetails
} from "../../../store/restaurants";

export default function RestaurantForm({
  formType,
  initialValues = {},
  restaurantId,
}) {
  console.log(initialValues)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState( "" );
  const [bannerImagePath, setBannerImagePath] = useState('');
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState( "");
  const [latitude, setLatitude] = useState( "");
  const [longitude, setLongitude] = useState( "");
  const [postalCode, setPostalCode] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [foodType, setFoodType] = useState("");

  const [initialRestaurant, setInitialRestaurant] = useState({});
  // const restaurantData = useSelector(
  //   (state) => state.restaurants?.singleRestaurant
  // );
  // console.log("Restaurant Data:", restaurantData);

  useEffect(() => {
    if (restaurantId && formType === "Edit") {
        dispatch(thunkGetRestaurantDetails(restaurantId))
            .then(responseData => {
              console.log("responseData: ",responseData)
              const data = responseData?.entities?.restaurants?.byId[restaurantId];
                if (data) {
                    setName(data.name);
                    setDescription(data.description);
                    setBannerImagePath(data.banner_image_path);
                    setStreetAddress(data.street_address);
                    setCity(data.city);
                    setState(data.state);
                    setCountry(data.country);
                    setLatitude(data.latitude.toString());
                    setLongitude(data.longitude.toString());
                    setPostalCode(data.postal_code);
                    setOpeningTime(data.opening_time);
                    setClosingTime(data.closing_time);
                    setFoodType(data.food_type);

                    setInitialRestaurant(data);
                } else {
                    console.error("singleRestaurant property is not present in the returned data");
                }
            })
            .catch(error => {
                console.error("Failed to fetch restaurant details:", error);
            });
    }
}, [dispatch, restaurantId, formType]);



  const fields = [
    {
      type: "text",
      name: "name",
      placeholder: "Restaurant Name",
      setter: setName,
      value: name,
    },
    {
      type: "textarea",
      name: "description",
      placeholder: "Description",
      setter: setDescription,
      value: description,
    },
    {
      type: "text",
      name: "bannerImagePath",
      placeholder: "Banner Image URL",
      setter: setBannerImagePath,
      value: bannerImagePath,
    },
    {
      type: "text",
      name: "streetAddress",
      placeholder: "Street Address",
      setter: setStreetAddress,
      value: streetAddress,
    },
    {
      type: "text",
      name: "city",
      placeholder: "City",
      setter: setCity,
      value: city,
    },
    {
      type: "text",
      name: "state",
      placeholder: "State",
      setter: setState,
      value: state,
    },
    {
      type: "text",
      name: "country",
      placeholder: "Country",
      setter: setCountry,
      value: country,
    },
    {
      type: "text",
      name: "latitude",
      placeholder: "Latitude",
      setter: setLatitude,
      value: latitude,
    },
    {
      type: "text",
      name: "longitude",
      placeholder: "Longitude",
      setter: setLongitude,
      value: longitude,
    },
    {
      type: "text",
      name: "postalCode",
      placeholder: "Postal Code",
      setter: setPostalCode,
      value: postalCode,
    },
    {
      type: "time",
      name: "openingTime",
      placeholder: "Opening Time",
      setter: setOpeningTime,
      value: openingTime,
    },
    {
      type: "time",
      name: "closingTime",
      placeholder: "Closing Time",
      setter: setClosingTime,
      value: closingTime,
    },
    {
      type: "text",
      name: "foodType",
      placeholder: "Food Type",
      setter: setFoodType,
      value: foodType,
    },
  ];

  const validations = [
    {
      fieldName: "name",
      rule: (value) => !value.trim(),
      message: "Restaurant Name is required",
    },
    {
      fieldName: "description",
      rule: (value) => !value.trim(),
      message: "Description is required",
    },
    {
      fieldName: "streetAddress",
      rule: (value) => !value.trim(),
      message: "Street Address is required",
    },
    {
      fieldName: "city",
      rule: (value) => !value.trim(),
      message: "City is required",
    },
    {
      fieldName: "state",
      rule: (value) => !value.trim(),
      message: "State is required",
    },
    {
      fieldName: "country",
      rule: (value) => !value.trim(),
      message: "Country is required",
    },
    {
      fieldName: "postalCode",
      rule: (value) => !value.trim(),
      message: "Postal Code is required",
    },
    {
      fieldName: "openingTime",
      rule: (value) => !value.trim(),
      message: "Opening Time is required",
    },
    {
      fieldName: "closingTime",
      rule: (value) => !value.trim(),
      message: "Closing Time is required",
    },
    {
      fieldName: "foodType",
      rule: (value) => !value.trim(),
      message: "Food Type is required",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const restaurantData = {
      name,
      description,
      banner_image_path: bannerImagePath,
      street_address: streetAddress,
      city,
      state,
      country,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      postal_code: postalCode,
      opening_time: openingTime,
      closing_time: closingTime,
      food_type: foodType,
    };

    if (formType === "Create") {
      dispatch(thunkCreateRestaurant(restaurantData))
        .then((response) => {
          if (response.type !== "restaurants/SET_RESTAURANT_ERROR") {
            console.log("Attempting to navigate...");
            navigate("/");
            // resetForm();
            alert("Restaurant successfully created!");
          } else {
            alert("Failed to create restaurant. Please try again.");
          }
        })
        .catch((error) => {
          console.error(error.message);
          alert("An error occurred. Please try again later.");
        });
    }

    if (formType === "Edit" && restaurantId) {
      const updatedRestaurantData = {
        ...initialRestaurant,
        name,
        description,
        banner_image_path: bannerImagePath,
        street_address: streetAddress,
        city,
        state,
        country,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        postal_code: postalCode,
        opening_time: openingTime,
        closing_time: closingTime,
        food_type: foodType,
      };
      console.log("Updated restaurant data:", updatedRestaurantData);
      

      dispatch(thunkUpdateRestaurant(updatedRestaurantData))
        .then((response) => {
          if (response.type !== "restaurants/SET_RESTAURANT_ERROR") {
            alert("Restaurant successfully updated!");
          } else {
            alert("Failed to update restaurant. Please try again.");
          }
        })
        .catch((error) => {
          console.error(error.message);
          alert("An error occurred. Please try again later.");
        });
    }
  };

  // const resetForm = () => {
  //   setName("");
  //   setDescription("");
  //   setBannerImagePath("");
  //   setStreetAddress("");
  //   setCity("");
  //   setState("");
  //   setCountry("");
  //   setLatitude("");
  //   setLongitude("");
  //   setPostalCode("");
  //   setOpeningTime("");
  //   setClosingTime("");
  //   setFoodType("");
  // };

  return (
    <FormContainer
      fields={fields}
      validations={validations}
      onSubmit={handleSubmit}
      submitLabel={
        formType === "Create" ? "Add Restaurant" : "Update Restaurant"
      }
    />
    // <FormContainer fields={fields} />
  );
}
