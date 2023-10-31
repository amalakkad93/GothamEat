/**
 * CreateReview Component
 *
 * This component provides an interface for users to submit a review for a restaurant.
 * It allows users to input a textual review, select a star rating, and submit their review.
 * The component ensures that users have provided adequate information before enabling the submit button.
 */
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../../context/Modal";
import { thunkCreateReview, uploadReviewImage, thunkGetReviewsByRestaurantId } from "../../../store/reviews";
import StarRatingInput from "../StarRatingInput";
import "./CreateReview.css";

export default function CreateReview({
  restaurantId,
  setReloadPage,
  onReviewPost,
}) {
  // Hook to allow component to dispatch actions to the Redux store
  const dispatch = useDispatch();

  // Context hook to access modal functions
  const { closeModal } = useModal();

  // Component state definitions
  const [review, setReview] = useState(""); // State for the textual review content
  const [stars, setStars] = useState(0); // State for the star rating
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true); // State to control the submit button's disabled status
  const [errors, setErrors] = useState({}); // State to track any errors
  const [message, setMessage] = useState(""); // State to store messages for the user
  const [selectedImage, setSelectedImage] = useState(null); // New state for selected image

  // Effect to determine if the submit button should be enabled
  useEffect(() => {
    setSubmitButtonDisabled(!(stars >= 1 && review.length >= 10));
  }, [stars, review]);

  /**
   * handleSubmitReview
   *
   * This function handles the submission of the review.
   * It dispatches the review data to the Redux store and backend.
   * If successful, it will close the modal and reload the page.
   *
   * @param {Object} e - The event object.
   */
  const handleSubmitReview = (e) => {
    e.preventDefault();
    dispatch(thunkCreateReview(restaurantId, review, stars, selectedImage))
      .then(result => {
        // After adding the review and image, re-fetch all reviews for the restaurant
        return dispatch(thunkGetReviewsByRestaurantId(restaurantId));
      })
      .then(() => {
        closeModal();
        setReloadPage((prevState) => !prevState);
        if (onReviewPost) {
          onReviewPost(); // Call the callback after posting the review
        }
      })
      .catch(error => {
        console.error(error);
        if (error.message) {
          setMessage(error.message);
        } else {
          setMessage("An unexpected error occurred.");
        }
      });
  };

  // Render the review form
  return (
    <div className="create-review-container">
      {/* Begin the review submission form */}
      <form onSubmit={handleSubmitReview} id="form-review">
        {/* Title for the review form */}
        <h2 className="review-form-h2">Write a Review</h2>
        {/* Display any messages to the user, such as errors */}
        <div>{message && <div className="error">{message}</div>}</div>

        {/* Text area for users to write their review */}
        <textarea
          placeholder="Write your review here..."
          type="text"
          name="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        {/* Display errors related to the review content */}
        {errors.review && <div className="error">{errors.review}</div>}

        {/* Section to select the star rating for the review */}
        <p className="star-container">
          <StarRatingInput
            rating={stars}
            onChange={(starValue) => {
              setStars(starValue);
            }}
          />
          <span> Stars</span>
        </p>
        {/* Display errors related to the star rating selection */}
        {errors.stars && <div className="error">{errors.stars}</div>}

        {/* Input for Image Selection */}
        <input type="file" onChange={(e) => setSelectedImage(e.target.files[0])} />

        {/* Button to submit the review */}
        <button
          id="submit-review-btn"
          type="submit"
          disabled={submitButtonDisabled}
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}
