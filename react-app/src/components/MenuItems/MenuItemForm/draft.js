import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../../context/Modal"
import { thunkCreateMenuItem } from "../../../store/menuItems";
import FormContainer from "../../CustomTags/FormContainer";
import "./MenuItemForm.css";

export default function MenuItemForm({
  formType,
  restaurantId,
  setReloadPage,
}) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    <div className="create-menu-item-container">
      <form onSubmit={handleSubmit}>
        {/* Input field for Menu Item Name */}
        <label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter menu item name"
          />
        </label>

        {/* Input field for Menu Item Description */}
        <label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter menu item description"
          />
        </label>

        {/* Dropdown or input field for Item Type, assuming it's a dropdown for now */}
        <label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >

            {/* Example options, modify as needed */}
            <option value="">--Select a type--</option>
            <option value="entree">Entree</option>
            <option value="dessert">Dessert</option>
            <option value="drink">Drink</option>
            <option value="side">Side</option>
          </select>
        </label>

        {/* Input field for Price */}
        <label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
          />
        </label>

        {/* Input for Image Selection */}
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button type="submit">Submit Menu Item</button>
      </form>
      {errorMessage && <div className="error">{errorMessage}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
    </div>
  );
}
