/**
 * MenuSection Component
 *
 * This component is responsible for rendering a section of the menu, which groups
 * multiple related menu items (e.g., "Starters", "Main Courses").
 * Each section displays its type (e.g., "starters") and contains a list of MenuItem components.
 *
 * @param {string} type - The type or category of the menu (e.g., "starters").
 * @param {Array} items - An array of menu items under the given type.
 * @param {Object} menuItemImgs - The images associated with menu items.
 */
import React from "react";
import MenuItem from "./ MenuItem";

import "./MenuItem.css";

export default function MenuSection({
  type,
  items,
  menuItemImages,
  restaurantId,
  setReloadPage,
}) {
  // Check to ensure the items prop is an array
  if (!Array.isArray(items)) {
    console.error("Items is not an array:", items);
    return null; // Return null to not render anything if items is not an array
  }

  return (
    <div className="menu-section">
      {/* Display the type or category of the menu */}
      <h3 className="menu-section-h3">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>

      {/* List all menu items under this section */}
      <ul>
        {items.map((item, index) => (
          <MenuItem
            key={item.id}
            item={item}
            menuItemImages={menuItemImages}
            restaurantId={restaurantId}
            setReloadPage={setReloadPage}
            isEagerLoading={index === 0}
          />
        ))}
      </ul>
    </div>
  );
}
