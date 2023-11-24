import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkGetReviewsByRestaurantId } from "../../../store/reviews";
import DeleteReview from "../DeleteReview";
import EditReview from "../EditReview";
import OpenModalButton from "../../Modals/OpenModalButton";
import StarRatingInput from "../StarRatingInput";
import "./GetReviews.css";

export default function GetReviews({
  restaurantId,
  reviewImages,
  setReloadPage,
}) {
  // Hook to allow component to dispatch actions to the Redux store
  const dispatch = useDispatch();

  // Redux state selectors to extract necessary data from the Redux store
  const reviews = useSelector((state) => state.reviews.reviews.byId || {});
  console.log("reviews: ", reviews);
  const users = useSelector((state) => state.reviews.users.byId || {});
  const currentUser = useSelector((state) => state.session?.user);
  const error = useSelector((state) => state.reviews?.error);

  // State to manage re-fetching of reviews
  const [reloadReviews, setReloadReviews] = useState(false);

  useEffect(() => {
    let isMounted = true; // variable to keep track of component mounted status

    const fetchReviews = async () => {
      if (restaurantId && isMounted) {
        await dispatch(thunkGetReviewsByRestaurantId(restaurantId));
      }
    };

    fetchReviews();

    return () => {
      isMounted = false; // set it to false when component unmounts
    };
  }, [dispatch, restaurantId, reloadReviews, setReloadPage]);

  // Error handling: Show an error message if there's an issue fetching reviews
  // if (error) return <p>Error: {error}</p>;

  return (
    <div className="reviews-list">
      {Object.keys(reviews)
        .sort(
          (a, b) =>
            new Date(reviews[b].created_at) - new Date(reviews[a].created_at)
        )
        .map((reviewId) => {
          const review = reviews[reviewId];
          if (!review) return null;
          let reviewImg;
          if (review.review_img_ids && review.review_img_ids.length > 0) {
            reviewImg = reviewImages.byId[review.review_img_ids[0]];
          }

          const user = users[review.user_id];

          return (
            <div key={review.id} className="review-item">
              {/* Header section for each review */}
              <div className="review-header">
                <div className="review-user-card">
                <span className="review-username">
                  {user ? user.username : "Unknown user"}
                </span>
                <span className="review-date">{review.created_at_display}</span>
                <div className="review-rating">
                  <StarRatingInput
                    rating={review.stars}
                    onChange={() => {}}
                    readOnly={true}
                    key={`rating-${review.id}`}
                  />
                </div>
                </div>

                {/* If the current user is the author of a review, show options to delete review or its image */}
                {currentUser && review.user_id === currentUser.id && (
                  <>
                    <OpenModalButton
                      className="post-edit-review-btn"
                      buttonText="Edit Review"
                      modalComponent={
                        <EditReview
                          restaurantId={restaurantId}
                          reviewId={review.id}
                          imageId={reviewImg ? reviewImg.id : null}
                          setReloadPage={setReloadPage}
                        />
                      }
                    />
                    <OpenModalButton
                      className="post-delete-review-btn"
                      buttonText="Delete Review"
                      modalComponent={
                        <DeleteReview
                          reviewId={review.id}
                          // imageId={review.image_id}
                          imageId={reviewImg ? reviewImg.id : null}
                          restaurantId={restaurantId}
                          setReloadPage={setReloadPage}
                        />
                      }
                    />
                  </>
                )}
              </div>

              {/* Display the main content of the review */}
              <p className="review-content">{review.review}</p>

              {/* Display review images */}
              <div className="review-images">
                {review.review_img_ids.map((imgId) => {
                  const img = reviewImages.byId[imgId];
                  if (img && img.image_path) {
                    return (
                      <div key={img.id} className="review-image-container">
                        <img
                          src={`${
                            img.image_path
                          }?timestamp=${new Date().getTime()}`}
                          alt="Review"
                          className="review-image"
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
