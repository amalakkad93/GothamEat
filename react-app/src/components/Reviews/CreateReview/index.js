import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkCreateReview } from "../../../store/reviews";

export default function CreateReview({ restaurantId }) {
  const dispatch = useDispatch();
  const [reviewText, setReviewText] = useState("");

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const reviewData = {
      review_text: reviewText,
     
    };
    await dispatch(thunkCreateReview(restaurantId, reviewData));
    setReviewText("");
  };

  return (
    <div className="create-review-container">
      <h2>Write a Review</h2>
      <form onSubmit={handleSubmitReview}>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review here..."
        />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}
