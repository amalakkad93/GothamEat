import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../../context/Modal"
import { thunkCreateMenuItem } from "../../../store/menuItems";
import FormContainer from "../../CustomTags/FormContainer";
import "./MenuItemForm.css";



function MenuItemForm({ formType, restaurantId, setReloadPage, menuItemId }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  // const imageInputRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fields = [
    {
      type: "text",
      name: "name",
      placeholder: "Menu Item Name",
      setter: setName,
      value: name,
      className: "",
      inputClassName: "form-input",
    },
    {
      type: "textarea",
      name: "description",
      placeholder: "Description",
      setter: setDescription,
      value: description,
      className: "",
      textareaClassName: "form-textarea",
    },
    {
      type: "select",
      name: "type",
      placeholder: "Type",
      setter: setType,
      value: type,
      className: "",
      selectClassName: "form-select",
      options: [
        { value: "", label: "Select a Type", disabled: true, selected: true },
        { value: "entree", label: "Entree" },
        { value: "dessert", label: "Dessert" },
        { value: "drink", label: "Drink" },
        { value: "side", label: "Side" },
      ],
    },
    {
      type: "text",
      name: "price",
      placeholder: "Price",
      setter: setPrice,
      value: price,
      className: "",
      inputClassName: "form-input",
    },
    {
      type: "file",
      name: "image",
      placeholder: "Upload Image",
      setter: setImage,
      // ref: imageInputRef,
      className: "",
      inputClassName: "form-input-file",
    },
  ];

  const validations = [
    {
      fieldName: "name",
      rule: (value) => !value.trim(),
      message: "Menu Item Name is required",
    },
    {
      fieldName: "description",
      rule: (value) => !value.trim(),
      message: "Description is required",
    },
    {
      fieldName: "type",
      rule: (value) => !value.trim(),
      message: "Type is required",
    },
    {
      fieldName: "price",
      rule: (value) => !value.trim() || isNaN(value),
      message: "Valid price is required",
    },
    {
      fieldName: "image",
      rule: () => !image || image === null || typeof image === 'undefined',
      message: "Image is required",
    },
];


  const handleSubmit = (e) => {
    e.preventDefault();

    const menuItemData = {
      name,
      description,
      type,
      price,
    };

    const handleSuccess = () => {
      // Handle success
      setSuccessMessage(
        formType === "Create"
          ? "Menu item created successfully!"
          : "Menu item updated successfully!"
      );

      // Clear the form
      setName("");
      setDescription("");
      setType("");
      setPrice("");
      setImage(null);

      // Reload or re-fetch the data in the parent component
      if (setReloadPage) {
        setReloadPage((prev) => !prev);
      }
    };

    if (image) {
      if (formType === "Create") {
        dispatch(thunkCreateMenuItem(restaurantId, menuItemData, image))
            .then(() => {
                handleSuccess();
                closeModal();
            })
            .catch((error) => {
                console.error(error);
                if (error.message) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage("An unexpected error occurred.");
                }
            });
    }

      // else if (formType === "Edit") {
      //   // Call the thunk action creator for updating a menu item
      //   dispatch(thunkEditMenuItem(restaurantId, menuItemData, image))
      //     .then(handleSuccess)
      //     .catch(error => {
      //       console.error(error);
      //       if (error.message) {
      //         setErrorMessage(error.message);
      //       } else {
      //         setErrorMessage("An unexpected error occurred.");
      //       }
      //     });
      // }
    } else {
      setErrorMessage("Please select a valid image file before submitting.");
    }
  };

  return (
    <div>
      {errorMessage && <div className="error">{errorMessage}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
      <FormContainer
        fields={fields}
        validations={validations}
        onSubmit={handleSubmit}
        submitLabel={
          formType === "Create" ? "Add" : "Update"
        }
        // imageRef={imageInputRef} // This is used to clear the file input field after submission
      />
    </div>
  );
}

export default React.memo(MenuItemForm);
