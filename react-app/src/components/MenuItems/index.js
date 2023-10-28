import React from "react";
import MenuItem from "./ MenuItem"
import './MenuItem.css'

export default function MenuSection({ type, items, menuItemImgs }) {
  if (!Array.isArray(items)) {
    console.error("Items is not an array:", items);
    return null; // or return a default UI or error message
}
  return (
    <div className="menu-section">
      <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
      <ul>
        {items.map(item => (
          <MenuItem key={item.id} item={item} menuItemImgs={menuItemImgs} />
        ))}
      </ul>
    </div>
  );
}
