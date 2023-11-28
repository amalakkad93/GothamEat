import React, { useState, useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
// import { navigate } from "@reach/router";

import FormContainer from "../../CustomTags/FormContainer";
import {
  thunkCreateRestaurant,
  thunkUpdateRestaurant,
  thunkGetRestaurantDetails,
} from "../../../store/restaurants";
import MessageComponent from "../../MessageComponent";

export default function RestaurantForm({
  formType,
  initialValues = {},
  restaurantId,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImagePath, setBannerImagePath] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [foodType, setFoodType] = useState("");
  const [image, setImage] = useState(null);

  const [initialRestaurant, setInitialRestaurant] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const [messageInfo, setMessageInfo] = useState({ message: null, type: null });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");


  useEffect(() => {
    if (restaurantId && formType === "Edit") {
      dispatch(thunkGetRestaurantDetails(restaurantId))
        .then((responseData) => {
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
            console.error(
              "singleRestaurant property is not present in the returned data"
            );
          }
        })
        .catch((error) => {
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
    {
      type: "file",
      name: "image",
      placeholder: "Upload Image",
      setter: setImage,
      className: "",
      inputClassName: "form-input-file",
    },
  ];

  const validations = [
    {
      fieldName: "name",
      rule: (value) => !value.trim() || value.length > 100,
      message:
        "Restaurant Name is required and must be less than 100 characters",
    },
    {
      fieldName: "description",
      rule: (value) => !value.trim() || value.length > 500,
      message: "Description is required and must be less than 500 characters",
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
      fieldName: "latitude",
      rule: (value) => !value || isNaN(value) || value < -90 || value > 90,
      message: "Latitude must be a valid number between -90 and 90",
    },
    {
      fieldName: "longitude",
      rule: (value) => !value || isNaN(value) || value < -180 || value > 180,
      message: "Longitude must be a valid number between -180 and 180",
    },
    {
      fieldName: "postalCode",
      rule: (value) => !/^\d{5}$/.test(value),
      message: "Postal Code must be a 5-digit number",
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
    {
      fieldName: "image",
      rule: () => !image || image === null || typeof image === "undefined",
      message: "Image is required",
    },
  ];

  // Function to show modal with a message
  const showMessageModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const restaurantData = {
      name,
      description,
      // banner_image_path: bannerImagePath,
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
      if (!image) {
        setErrorMessage("Please select a valid image file before submitting.");
        return;
      }

      console.log("Image to be uploaded:", image);
      setImageLoading(true);
      dispatch(thunkCreateRestaurant(restaurantData, image))
        .then((response) => {
          console.log("Create response:", response);
          if (response.type !== "restaurants/SET_RESTAURANT_ERROR") {
            showMessageModal("Restaurant successfully created!");
            console.log("Message set: Restaurant created");
            navigate("/owner/restaurants");
          } else {
            showMessageModal("Failed to create restaurant. Please try again.");
            console.log("Message set: Create failed");
          }
        })
        .catch((error) => {
          console.error("Create error:", error.message);
          showMessageModal("An error occurred. Please try again later.");
        });
    }

    if (formType === "Edit" && restaurantId) {
      setImageLoading(true);
      dispatch(
        thunkUpdateRestaurant(
          restaurantId,
          restaurantData,
          image,
          initialRestaurant?.banner_image_path
        )
      )
        .then((response) => {
          if (response.type !== "restaurants/SET_RESTAURANT_ERROR") {
            showMessageModal("Restaurant successfully updated!");
            navigate("/owner/restaurants");
          } else {
            showMessageModal("Failed to create restaurant. Please try again.");

          }
        })
        .catch((error) => {
          console.error(error.message);
          showMessageModal("An error occurred. Please try again later.");

        })
        .finally(() => {
          setImageLoading(false);
        });
    }
  };

  return (
    <>
    <MessageComponent
        show={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
      />
      
      <FormContainer
        fields={fields}
        validations={validations}
        onSubmit={handleSubmit}
        submitLabel={
          formType === "Create" ? "Add Restaurant" : "Update Restaurant"
        }
        errors={formErrors}
      />
    </>
  );
}
// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch, shallowEqual } from "react-redux";
// import { NavLink, useNavigate } from "react-router-dom";
// // import { navigate } from "@reach/router";

// import FormContainer from "../../CustomTags/FormContainer";
// import {
//   thunkCreateRestaurant,
//   thunkUpdateRestaurant,
//   thunkGetRestaurantDetails,
// } from "../../../store/restaurants";
// import MessageComponent from "../../MessageComponent";

// export default function RestaurantForm({
//   formType,
//   initialValues = {},
//   restaurantId,
// }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [bannerImagePath, setBannerImagePath] = useState("");
//   const [streetAddress, setStreetAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [state, setState] = useState("");
//   const [country, setCountry] = useState("");
//   const [latitude, setLatitude] = useState("");
//   const [longitude, setLongitude] = useState("");
//   const [postalCode, setPostalCode] = useState("");
//   const [openingTime, setOpeningTime] = useState("");
//   const [closingTime, setClosingTime] = useState("");
//   const [foodType, setFoodType] = useState("");
//   const [image, setImage] = useState(null);

//   const [initialRestaurant, setInitialRestaurant] = useState({});
//   const [formErrors, setFormErrors] = useState({});

//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [imageLoading, setImageLoading] = useState(false);

//   const [messageInfo, setMessageInfo] = useState({ message: null, type: null });
//   useEffect(() => {
//     if (restaurantId && formType === "Edit") {
//       dispatch(thunkGetRestaurantDetails(restaurantId))
//         .then((responseData) => {
//           const data = responseData?.entities?.restaurants?.byId[restaurantId];
//           if (data) {
//             setName(data.name);
//             setDescription(data.description);
//             setBannerImagePath(data.banner_image_path);
//             setStreetAddress(data.street_address);
//             setCity(data.city);
//             setState(data.state);
//             setCountry(data.country);
//             setLatitude(data.latitude.toString());
//             setLongitude(data.longitude.toString());
//             setPostalCode(data.postal_code);
//             setOpeningTime(data.opening_time);
//             setClosingTime(data.closing_time);
//             setFoodType(data.food_type);

//             setInitialRestaurant(data);
//           } else {
//             console.error(
//               "singleRestaurant property is not present in the returned data"
//             );
//           }
//         })
//         .catch((error) => {
//           console.error("Failed to fetch restaurant details:", error);
//         });
//     }
//   }, [dispatch, restaurantId, formType]);

//   // useEffect hook to monitor messageInfo changes
//   useEffect(() => {
//     if (messageInfo.message && messageInfo.type) {
//       // This will clear the message after 5 seconds
//       const timer = setTimeout(() => {
//         setMessageInfo({ message: null, type: null });
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [messageInfo]);

//   const fields = [
//     {
//       type: "text",
//       name: "name",
//       placeholder: "Restaurant Name",
//       setter: setName,
//       value: name,
//     },
//     {
//       type: "textarea",
//       name: "description",
//       placeholder: "Description",
//       setter: setDescription,
//       value: description,
//     },
//     {
//       type: "text",
//       name: "streetAddress",
//       placeholder: "Street Address",
//       setter: setStreetAddress,
//       value: streetAddress,
//     },
//     {
//       type: "text",
//       name: "city",
//       placeholder: "City",
//       setter: setCity,
//       value: city,
//     },
//     {
//       type: "text",
//       name: "state",
//       placeholder: "State",
//       setter: setState,
//       value: state,
//     },
//     {
//       type: "text",
//       name: "country",
//       placeholder: "Country",
//       setter: setCountry,
//       value: country,
//     },
//     {
//       type: "text",
//       name: "latitude",
//       placeholder: "Latitude",
//       setter: setLatitude,
//       value: latitude,
//     },
//     {
//       type: "text",
//       name: "longitude",
//       placeholder: "Longitude",
//       setter: setLongitude,
//       value: longitude,
//     },
//     {
//       type: "text",
//       name: "postalCode",
//       placeholder: "Postal Code",
//       setter: setPostalCode,
//       value: postalCode,
//     },
//     {
//       type: "time",
//       name: "openingTime",
//       placeholder: "Opening Time",
//       setter: setOpeningTime,
//       value: openingTime,
//     },
//     {
//       type: "time",
//       name: "closingTime",
//       placeholder: "Closing Time",
//       setter: setClosingTime,
//       value: closingTime,
//     },
//     {
//       type: "text",
//       name: "foodType",
//       placeholder: "Food Type",
//       setter: setFoodType,
//       value: foodType,
//     },
//     {
//       type: "file",
//       name: "image",
//       placeholder: "Upload Image",
//       setter: setImage,
//       className: "",
//       inputClassName: "form-input-file",
//     },
//   ];

//   const validations = [
//     {
//       fieldName: "name",
//       rule: (value) => !value.trim() || value.length > 100,
//       message:
//         "Restaurant Name is required and must be less than 100 characters",
//     },
//     {
//       fieldName: "description",
//       rule: (value) => !value.trim() || value.length > 500,
//       message: "Description is required and must be less than 500 characters",
//     },
//     {
//       fieldName: "streetAddress",
//       rule: (value) => !value.trim(),
//       message: "Street Address is required",
//     },
//     {
//       fieldName: "city",
//       rule: (value) => !value.trim(),
//       message: "City is required",
//     },
//     {
//       fieldName: "state",
//       rule: (value) => !value.trim(),
//       message: "State is required",
//     },
//     {
//       fieldName: "country",
//       rule: (value) => !value.trim(),
//       message: "Country is required",
//     },
//     {
//       fieldName: "latitude",
//       rule: (value) => !value || isNaN(value) || value < -90 || value > 90,
//       message: "Latitude must be a valid number between -90 and 90",
//     },
//     {
//       fieldName: "longitude",
//       rule: (value) => !value || isNaN(value) || value < -180 || value > 180,
//       message: "Longitude must be a valid number between -180 and 180",
//     },
//     {
//       fieldName: "postalCode",
//       rule: (value) => !/^\d{5}$/.test(value),
//       message: "Postal Code must be a 5-digit number",
//     },
//     {
//       fieldName: "openingTime",
//       rule: (value) => !value.trim(),
//       message: "Opening Time is required",
//     },
//     {
//       fieldName: "closingTime",
//       rule: (value) => !value.trim(),
//       message: "Closing Time is required",
//     },
//     {
//       fieldName: "foodType",
//       rule: (value) => !value.trim(),
//       message: "Food Type is required",
//     },
//     {
//       fieldName: "image",
//       rule: () => !image || image === null || typeof image === "undefined",
//       message: "Image is required",
//     },
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const restaurantData = {
//       name,
//       description,
//       // banner_image_path: bannerImagePath,
//       street_address: streetAddress,
//       city,
//       state,
//       country,
//       latitude: parseFloat(latitude),
//       longitude: parseFloat(longitude),
//       postal_code: postalCode,
//       opening_time: openingTime,
//       closing_time: closingTime,
//       food_type: foodType,
//     };

//     if (formType === "Create") {
//       if (!image) {
//         setErrorMessage("Please select a valid image file before submitting.");
//         return;
//       }

//       console.log("Image to be uploaded:", image);
//       setImageLoading(true);
//       dispatch(thunkCreateRestaurant(restaurantData, image))
//         .then((response) => {
//           if (response.type !== "restaurants/SET_RESTAURANT_ERROR") {
//             navigate("/owner/restaurants");
//             setMessageInfo({ message: "Restaurant successfully created!" });
//           } else {
//             setMessageInfo({
//               message: "Failed to create restaurant. Please try again.",
//             });
//           }
//         })
//         .catch((error) => {
//           console.error(error.message);
//           setMessageInfo({
//             message: "An error occurred. Please try again later.",
//           });
//         });
//     }

//     if (formType === "Edit" && restaurantId) {
//       setImageLoading(true);
//       dispatch(
//         thunkUpdateRestaurant(
//           restaurantId,
//           restaurantData,
//           image,
//           initialRestaurant?.banner_image_path
//         )
//       )
//         .then((response) => {
//           if (response.type !== "restaurants/SET_RESTAURANT_ERROR") {
//             setMessageInfo({
//               message: "Restaurant successfully updated!",
//               type: "success",
//             });
//             navigate("/owner/restaurants");
//           } else {
//             setMessageInfo({
//               message: "Failed to update restaurant. Please try again.",
//               type: "error",
//             });
//           }
//         })
//         .catch((error) => {
//           console.error(error.message);
//           setMessageInfo({
//             message: "An error occurred. Please try again later.",
//             type: "error",
//           });
//         })
//         .finally(() => {
//           setImageLoading(false);
//         });
//     }
//   };

//   return (
//     <>
//       {messageInfo.message && (
//         <MessageComponent
//           message={messageInfo.message}
//           type={messageInfo.type}
//         />
//       )}
//       <FormContainer
//         fields={fields}
//         validations={validations}
//         onSubmit={handleSubmit}
//         submitLabel={
//           formType === "Create" ? "Add Restaurant" : "Update Restaurant"
//         }
//         errors={formErrors}
//       />
//     </>
//   );
// }
