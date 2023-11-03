import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../../context/Modal"
import { thunkCreateMenuItem, thunkUpdateMenuItem, thunkGetMenuItemDetails } from "../../../store/menuItems";
import FormContainer from "../../CustomTags/FormContainer";
import "./MenuItemForm.css";



// function MenuItemForm({ formType, restaurantId, setReloadPage, menuItemId }) {
  function MenuItemForm({ formType, restaurantId, setReloadPage, menuItemId, imageId, initialData }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  // const imageInputRef = useRef(null);

  // const [name, setName] = useState("");
  // const [description, setDescription] = useState("");
  // const [type, setType] = useState("");
  // const [price, setPrice] = useState("");

  // const [name, setName] = useState(initialData ? initialData.name : "");
  // const [description, setDescription] = useState(initialData ? initialData.description : "");
  // const [type, setType] = useState(initialData ? initialData.type : "");
  // const [price, setPrice] = useState(initialData ? initialData.price : "");
const [name, setName] = useState(initialData?.name || "");
const [description, setDescription] = useState(initialData?.description || "");
const [type, setType] = useState(initialData?.type || "");
const [price, setPrice] = useState(initialData?.price || "");
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description);
        setType(initialData.type);
        setPrice(initialData.price);
        setImage(initialData.image);
        // handle the image separately since it's a file input
    }
}, [initialData]);

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
        // { value: "", label: "Select a Type", disabled: true, selected: true },
        { value: "", label: "Select a Type", disabled: true },

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
      // rule: (value) => !value.trim() || isNaN(value),
      rule: (value) => (typeof value === 'string' ? !value.trim() : !value) || isNaN(value),

      message: "Valid price is required",
    },
    {
      fieldName: "image",
      rule: () => !image || image === null || typeof image === 'undefined',
      // rule: () => formType === "Create" ? (!image || image === null || typeof image === 'undefined') : false,
      message: "Image is required",
    },
];


const handleSubmit = (e) => {
  // console.log("handleSubmit was triggered!");
  e.preventDefault();
  // console.log("Form is being submitted. Form type:", formType);
  // console.log("Data:", {name, description, type, price, image});
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
    // forceUpdate(Math.random());
  };

  if (formType === "Create") {
    if (!image) {
      setErrorMessage("Please select a valid image file before submitting.");
      return;
    }
    // console.log("Dispatching with image:", image);

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
  } else if (formType === "Edit") {
    // console.log("Updating menu item with new image:", image);

    dispatch(thunkUpdateMenuItem(menuItemId, menuItemData, image, initialData?.image_url))
      .then(() => {
        handleSuccess();
        dispatch(thunkGetMenuItemDetails(menuItemId));

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
};

  // console.log("Name state:", name);
  // console.log("Description state:", description);
  // console.log("Type state:", type);
  // console.log("Price state:", price);

  return (
    <div>
      {/* {errorMessage && <div className="error">{errorMessage}</div>}
      {successMessage && <div className="success">{successMessage}</div>} */}
      <button onClick={handleSubmit}>Manual Submit</button>

      <FormContainer
        fields={fields}
        validations={validations}
        // validations={[]}
        onSubmit={handleSubmit}
        submitLabel={
          formType === "Create" ? "Add" : "Update"
        }

        name={name}
        description={description}
        type={type}
        price={price}
        image={image}

        // imageRef={imageInputRef} // This is used to clear the file input field after submission
      />
    </div>
  );
}

// export default React.memo(MenuItemForm);
export default MenuItemForm;
