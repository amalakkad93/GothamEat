import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../../context/Modal";
import {
  thunkCreateMenuItem,
  thunkUpdateMenuItem,
  thunkGetMenuItemDetails,
} from "../../../store/menuItems";
import FormContainer from "../../CustomTags/FormContainer";
import "./MenuItemForm.css";

function MenuItemForm({
  formType,
  restaurantId,
  setReloadPage,
  menuItemId,
  imageId,
  initialData,
}) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [type, setType] = useState(initialData?.type || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [image, setImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setType(initialData.type);
      setPrice(initialData.price);
      setImage(initialData.image);
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
      rule: (value) =>
        (typeof value === "string" ? !value.trim() : !value) || isNaN(value),

      message: "Valid price is required",
    },
    {
      fieldName: "image",
      rule: () => !image || image === null || typeof image === "undefined",
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

      // Reload or re-fetch the data in the parent components
      if (setReloadPage) {
        setReloadPage((prev) => !prev);
      }
    };

    if (formType === "Create") {
      if (!image) {
        setErrorMessage("Please select a valid image file before submitting.");
        return;
      }
      setImageLoading(true);
      dispatch(thunkCreateMenuItem(restaurantId, menuItemData, image))
        .then(() => {
          handleSuccess();
          if (setReloadPage) setReloadPage((prev) => !prev);
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
      dispatch(
        thunkUpdateMenuItem(
          menuItemId,
          menuItemData,
          image,
          initialData?.image_url
        )
      )
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

  return (
    <div>
      {errorMessage && <div className="error">{errorMessage}</div>}
      {successMessage && <div className="success">{successMessage}</div>}

      <FormContainer
        fields={fields}
        validations={validations}
        onSubmit={handleSubmit}
        submitLabel={formType === "Create" ? "Add" : "Update"}
        name={name}
        description={description}
        type={type}
        price={price}
        image={image}
      />
    </div>
  );
}
export default MenuItemForm;
