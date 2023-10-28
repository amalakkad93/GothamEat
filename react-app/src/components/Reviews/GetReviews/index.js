import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkGetReviewsByRestaurantId } from "../../../store/reviews";
import "./GetReviews.css";

export default function GetReviews({ restaurantId }) {
  const dispatch = useDispatch();
  const reviews = useSelector((state) => state.reviews?.reviews || {});
  const users = useSelector((state) => state.reviews?.users || {});
  const error = useSelector((state) => state.reviews?.error);

  useEffect(() => {
    if (restaurantId) {
      dispatch(thunkGetReviewsByRestaurantId(restaurantId));
    }
  }, [dispatch, restaurantId]);

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="reviews-container">
      <h2 className="reviews-title">Reviews</h2>
      <div className="reviews-list">
        {Object.values(reviews).map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <span className="review-username">
                {users[review.user_id].username}
              </span>
              <span className="review-date">
                {review.created_at}
              </span>
            </div>
            <p className="review-content">{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
