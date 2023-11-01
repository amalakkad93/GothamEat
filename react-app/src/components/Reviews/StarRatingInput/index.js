import React, { useState, useEffect } from 'react';
import './StarRatingInput.css'

/**
 * StarRatingInput Component
 *
 * This component provides a star-based rating interface. Users can hover over stars to preview the rating
 * and click to set a specific rating. The component visually reflects both the current rating and any hovered rating.
 */
export default function StarRatingInput({ rating, onChange }) {

  // State to track the star rating being hovered over
  const [hoverRating, setHoverRating] = useState(0);

  // State to track the currently active (or clicked) star rating
  const [activeRating, setActiveRating] = useState(rating);

  // Effect to synchronize the activeRating state with the rating prop
  useEffect(() => {
    setActiveRating(rating);
  }, [rating]);

  /**
   * Sets the hovered star rating when the mouse enters a star.
   *
   * @param {number} number - The star number being hovered over.
   */
  const handleMouseEnter = (number) => {
    setHoverRating(number);
  };

  /**
   * Resets the hovered star rating when the mouse leaves a star.
   */
  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  /**
   * Sets the active star rating when a star is clicked and triggers the onChange callback.
   *
   * @param {number} number - The star number being clicked.
   */
  const handleClick = (number) => {
    setActiveRating(number);
    onChange(number);
  };

  /**
   * Generates the star icon with appropriate filled or empty styling based on the current and hovered ratings.
   *
   * @param {number} number - The star number for which the icon is generated.
   * @returns {JSX.Element} - A styled star icon.
   */
  const starsIcon = (number) => {
    let className = "";
    if (hoverRating >= number) {
      className = "filled";
    } else if (activeRating >= number) {
      className = "filled";
    } else {
      className = "empty";
    }

    return (
      <div
        key={number}
        className={className}
        onMouseEnter={() => handleMouseEnter(number)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(number)}
      >
        <i className="fa fa-star" ></i>
      </div>
    );
  };

  // Render the star rating input interface
  return (
    <div className="rating-input">
      {/* Map over the range [1, 2, 3, 4, 5] to generate the 5 star icons */}
      { [1, 2, 3, 4, 5].map(number => starsIcon(number)) }
    </div>
  );
}
