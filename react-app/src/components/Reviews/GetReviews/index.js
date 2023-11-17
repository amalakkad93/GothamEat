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
          let reviewImg; // Define reviewImg here
          if (review.review_img_ids && review.review_img_ids.length > 0) {
            reviewImg = reviewImages.byId[review.review_img_ids[0]]; // Assign the first image as reviewImg
          }

          // Access the user who posted the review
          const user = users[review.user_id];

          return (
            <div key={review.id} className="review-item">
              {/* Header section for each review */}
              <div className="review-header">
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
                  const img = reviewImages.byId[imgId]; // Access byId for images
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

// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { thunkGetReviewsByRestaurantId } from "../../../store/reviews";
// import DeleteReview from "../DeleteReview";
// import EditReview from "../EditReview";
// import OpenModalButton from "../../Modals/OpenModalButton";
// import "./GetReviews.css";

// export default function GetReviews({ restaurantId, reviewImages, setReloadPage }) {
//   // Hook to allow component to dispatch actions to the Redux store
//   const dispatch = useDispatch();
//   console.log("reviewImages: ", reviewImages);

//   // Redux state selectors to extract necessary data from the Redux store
//   // const reviews = useSelector((state) => state.reviews?.reviews || {});
//   const reviews = useSelector(state => state.reviews.reviews.byId || {});

//   console.log("reviews: ", reviews);
// // const reviewImages = useSelector(state => state.reviews.reviewImages.byId);

//   const users = useSelector((state) => state.reviews?.users || {});
//   // const reviewImages = useSelector(
//   //   (state) => state.reviews?.reviewImages || {}
//   // );
//   const currentUser = useSelector((state) => state.session?.user);
//   const error = useSelector((state) => state.reviews?.error);

//   // State to manage re-fetching of reviews
//   const [reloadReviews, setReloadReviews] = useState(false);

//   useEffect(() => {
//     let isMounted = true; // variable to keep track of component mounted status

//     const fetchReviews = async () => {
//       if (restaurantId && isMounted) {
//         await dispatch(thunkGetReviewsByRestaurantId(restaurantId));
//       }
//     };

//     fetchReviews();

//     return () => {
//       isMounted = false; // set it to false when component unmounts
//     };
//   }, [dispatch, restaurantId, setReloadPage]);

//   // Error handling: Show an error message if there's an issue fetching reviews
//   if (error) return <p>Error: {error}</p>;

//   // Loading state: Display a loading message until reviews and users data is fetched
//   // if (Object.keys(reviews).length === 0 || Object.keys(users).length === 0) {
//   //   // return <div>Loading...</div>;
//   // }

//   return (
//     <div className="reviews-list">
//       {Object.keys(reviews)
//         .sort(
//           (a, b) =>
//             new Date(reviews[b].created_at) - new Date(reviews[a].created_at)
//         )
//         .map((reviewId) => {
//           const review = reviews[reviewId];
//           if (!review) return null;
//           let reviewImg; // Define reviewImg here
//           if (review.review_img_ids && review.review_img_ids.length > 0) {
//             reviewImg = reviewImages.byId[review.review_img_ids[0]]; // Assign the first image as reviewImg
//           }

//           return (
//             <div key={review.id} className="review-item">
//               {/* Header section for each review */}
//               <div className="review-header">
//                 <span className="review-username">
//                   {users[review.user_id]?.username ?? null}
//                 </span>
//                 <span className="review-date">{review.created_at_display}</span>

//                 {/* If the current user is the author of a review, show options to delete review or its image */}
//                 {currentUser && review.user_id === currentUser.id && (
//                   <>
//                     <OpenModalButton
//                       className="post-edit-review-btn"
//                       buttonText="Edit Review"
//                       modalComponent={
//                         <EditReview
//                           restaurantId={restaurantId}
//                           reviewId={review.id}
//                           imageId={reviewImg ? reviewImg.id : null}
//                           setReloadPage={setReloadPage}
//                           // onReviewUpdate={() => setReloadPage((prev) => !prev)}
//                         />
//                       }
//                     />
//                     <OpenModalButton
//                       className="post-delete-review-btn"
//                       buttonText="Delete Review"
//                       modalComponent={
//                         <DeleteReview
//                           reviewId={review.id}
//                           imageId={review.image_id}
//                           restaurantId={restaurantId}
//                           setReloadPage={setReloadPage}
//                         />
//                       }
//                     />
//                   </>
//                 )}
//               </div>

//               {/* Display the main content of the review */}
//               <p className="review-content">{review.review}</p>

//                   {/* Display review images */}
//                   <div className="review-images">
//               {review.review_img_ids.map((imgId) => {
//                 const img = reviewImages.byId[imgId]; // Access byId for images
//                 if (img && img.image_path) {
//                   return (
//                     <div key={img.id} className="review-image-container">
//                       <img
//                         src={`${img.image_path}?timestamp=${new Date().getTime()}`}
//                         alt="Review"
//                         className="review-image"
//                       />
//                     </div>
//                   );
//                 }
//                 return null;
//               })}
//             </div>
//           </div>
//         );
//       })}
//   </div>
// );
//     }

// return (
//   <div className="reviews-list">
//     {/* Map over the keys (IDs) of the reviews object, and sort them based on the creation date */}
//     {Object.keys(reviews)
//       .sort(
//         (a, b) =>
//           new Date(reviews[b].created_at) - new Date(reviews[a].created_at)
//       )
//       .map((reviewId) => {
//         const review = reviews[reviewId];
//         return (
//           <div key={review.id} className="review-item">
//             {/* Header section for each review, displaying the reviewer's username and the review's creation date */}
//             <div className="review-header">
//               {/* Display the username of the reviewer */}
//               <span className="review-username">
//                 {users[review.user_id]?.username ?? null}
//               </span>
//               {/* Display the date the review was created */}
//               <span className="review-date">{review.created_at_display}</span>
//             </div>
//             {/* Display the main content of the review */}
//             <p className="review-content">{review.review}</p>

//             {/* Display review images */}
//             <div className="review-images">
//               {(review.review_img_ids || []).map((imgId) => {
//                 const img = reviewImages[imgId];
//                 if (img && img.image_path) {
//                   return (
//                     <div key={img.id} className="review-image-container">
//                       <img
//                         src={img.image_path}
//                         alt="Review"
//                         className="review-image"
//                       />
//                     </div>
//                   );
//                 }
//                 return null;
//               })}
//             </div>
//           </div>
//         );
//       })}
//   </div>
// );
// }

// /**
//  * GetReviews Component
//  *
//  * This component is responsible for fetching and displaying the reviews associated with a specific restaurant.
//  * It fetches reviews from the Redux store and maps over each review to render it on the screen.
//  * It also handles error scenarios and loading states.
//  */
// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { thunkGetReviewsByRestaurantId } from "../../../store/reviews";
// import "./GetReviews.css";

// export default function GetReviews({ restaurantId }) {
//   // Hook to allow component to dispatch actions to the Redux store
//   const dispatch = useDispatch();

//   // Redux state selectors to extract necessary data from the Redux store
//   const reviews = useSelector((state) => state.reviews?.reviews || {});
//   const users = useSelector((state) => state.reviews?.users || {});
//   const reviewImages = useSelector((state) => state.reviews?.reviewImages || {});

//   const error = useSelector((state) => state.reviews?.error);

//   // Logging for debugging purposes
//   console.log("*********Users:", users);
//   console.log("*********Reviews:", reviews);

//   // Effect to fetch reviews by restaurant ID
//   useEffect(() => {
//     if (restaurantId) {
//       dispatch(thunkGetReviewsByRestaurantId(restaurantId));
//     }
//   }, [dispatch, restaurantId]);

//   // Error handling: Show an error message if there's an issue fetching reviews
//   if (error) return <p>Error: {error}</p>;

//   // Loading state: Display a loading message until reviews and users data is fetched
//   if (Object.keys(reviews).length === 0 || Object.keys(users).length === 0) {
//     return <div>Loading...</div>;
//   }

// // Render the list of reviews
// return (
//   <div className="reviews-list">
//     {/* Map over the keys (IDs) of the reviews object, and sort them based on the creation date */}
//     {Object.keys(reviews)
//       .sort((a, b) => new Date(reviews[b].created_at) - new Date(reviews[a].created_at))
//       .map((reviewId) => {
//         const review = reviews[reviewId];
//         return (
//           <div key={review.id} className="review-item">
//             {/* Header section for each review, displaying the reviewer's username and the review's creation date */}
//             <div className="review-header">
//               {/* Display the username of the reviewer */}
//               <span className="review-username">
//                 {users[review.user_id]?.username ?? null}
//               </span>
//               {/* Display the date the review was created */}
//               <span className="review-date">{review.created_at_display}</span>
//             </div>
//             {/* Display the main content of the review */}
//             <p className="review-content">{review.review}</p>
//           </div>
//         );
//       })}
//   </div>
// );
// }
