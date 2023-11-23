import React, { useState } from "react";
import "./MenuFilter.css";

function MenuFilter({ onFilterChange, onFilterReset, menuTypes }) {
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleTypeChange = (type) => {
    setSelectedTypes((prevTypes) => {
      const newTypes = new Set(prevTypes);
      if (newTypes.has(type)) {
        newTypes.delete(type);
      } else {
        newTypes.add(type);
      }
      return newTypes;
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ types: Array.from(selectedTypes), minPrice, maxPrice });
  };

  return (
    <form onSubmit={handleFilterSubmit} className="menu-filter-form">
      <div className="type-filters">
        {Object.keys(menuTypes).map((type) => (
          <label key={type}>
            <input
              type="checkbox"
              checked={selectedTypes.has(type)}
              onChange={() => handleTypeChange(type)}
            />
            {type}
          </label>
        ))}
      </div>

      <div className="price-range-slider">
        <label>
          Min Price: ${minPrice}
          <input
            type="range"
            min="0"
            max="100"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </label>
        <label>
          Max Price: ${maxPrice}
          <input
            type="range"
            min="0"
            max="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </label>
      </div>

      <button className="apply-filter-btn" type="submit">
        Apply Filter
      </button>
      <button
        className="reset-filter-btn"
        type="button"
        onClick={onFilterReset}
      >
        Reset Filter
      </button>
    </form>
  );
}

export default MenuFilter;
