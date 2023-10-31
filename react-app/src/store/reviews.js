import { csrfFetch } from "./csrf";

// Action Types
const SET_REVIEWS = "reviews/SET_REVIEWS";
const ADD_REVIEW = "reviews/ADD_REVIEW";
const UPLOAD_REVIEW_IMAGE = "reviews/UPLOAD_REVIEW_IMAGE";
const DELETE_REVIEW = "reviews/DELETE_REVIEW";
const DELETE_REVIEW_IMAGE = "reviews/DELETE_REVIEW_IMAGE";
const SET_REVIEW_ERROR = "reviews/SET_REVIEW_ERROR";

// Action Creators
const actionSetReviews = (reviews, images, users) => ({
  type: SET_REVIEWS,
  reviews,
  images,
  users,
});

const actionAddReview = (review, users) => ({
  type: ADD_REVIEW,
  review,
  users,
});

const actionAddReviewImage = (reviewId, imageUrl) => {
  return {
    type: "UPLOAD_REVIEW_IMAGE",
    reviewId,
    imageUrl,
  };
};

const actionDeleteReview = (reviewId) => ({
  type: DELETE_REVIEW,
  reviewId,
});

const actionDeleteReviewImage = (imageId) => ({
  type: DELETE_REVIEW_IMAGE,
  imageId,
});

const actionSetReviewError = (error) => ({
  type: SET_REVIEW_ERROR,
  error,
});

// Thunks
export const thunkGetReviewsByRestaurantId =
  (restaurantId) => async (dispatch) => {
    try {
      console.log('Fetching reviews for restaurant:', restaurantId); // Add this
      const response = await csrfFetch(
        `/api/restaurants/${restaurantId}/reviews`
      );
      const data = await response.json(); // Move this outside of the if condition
      if (response.ok) {
        dispatch(
          actionSetReviews(
            data.entities.reviews || {},
            data.entities.reviewImages || {},
            data.entities.users || {}
          )
        );
      } else {
        console.error('Server responded with error:', data.error); // Add this
        dispatch(actionSetReviewError(data.error));
      }
    } catch (error) {
      console.error('Error while fetching reviews:', error); // Add this
      dispatch(
        actionSetReviewError(
          "An unexpected error occurred while fetching the reviews."
        )
      );
    }
  };


export const thunkCreateReview = (restaurantId, review, stars, image) => {
  return async (dispatch) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Submit the review
        const reviewResponse = await csrfFetch(
          `/api/restaurants/${restaurantId}/reviews`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ review, stars }),
          }
        );

        if (!reviewResponse.ok) {
          const data = await reviewResponse.json();
          dispatch(actionSetReviewError(data.error));
          return reject(new Error(data.error));
        }

        const reviewData = await reviewResponse.json();
        dispatch(
          actionAddReview(
            reviewData.entities.reviews,
            reviewData.entities.users
          )
        );

        if (image && reviewData.reviewId) {
          // 2. Fetch the presigned URL
          console.log("Fetching presigned URL...");

          const presignedResponse = await csrfFetch(
            `/s3/generate_presigned_url?filename=${image.name}&contentType=${image.type}`
          );

          console.log("Response from presigned URL:", presignedResponse);

          if (
            !presignedResponse.headers
              .get("content-type")
              .includes("application/json")
          ) {
            throw new Error(
              "Server didn't respond with JSON. Check the server's response."
            );
          }
          const presignedData = await presignedResponse.json();
          const { presigned_url } = presignedData;

          // 3. Upload the review image directly to S3 using the presigned URL
          await fetch(presigned_url, {
            method: "PUT",
            body: image,
            headers: {
              "Content-Type": image.type,
            },
          });

          // 4. Send the image URL to the backend to store it
          await csrfFetch(`/api/reviews/${reviewData.reviewId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_url: presignedData.file_url }),
          });

          dispatch(
            actionAddReviewImage(reviewData.reviewId, presignedData.file_url)
          );
        }

        resolve({ message: reviewData.message, reviewId: reviewData.reviewId });
      } catch (error) {
        dispatch(
          actionSetReviewError(
            error.message ||
              "An unexpected error occurred while creating the review."
          )
        );
        reject(error);
      }
    });
  };
};
export const thunkDeleteReview = (reviewId, imageId) => async (dispatch) => {
  try {
    // Delete the review
    if (reviewId) {
      const reviewResponse = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!reviewResponse.ok) {
        const data = await reviewResponse.json();
        dispatch(actionSetReviewError(data.error));
        throw new Error(data.error);
      }
      dispatch(actionDeleteReview(reviewId));
    }

    // Delete the review image if there's an imageId
    if (imageId) {
      const imageResponse = await csrfFetch(`/api/review_imgs/${imageId}`, {
        method: "DELETE",
      });
      if (!imageResponse.ok) {
        const data = await imageResponse.json();
        dispatch(actionSetReviewError(data.error));
        throw new Error(data.error);
      }
      dispatch(actionDeleteReviewImage(imageId));
    }

    return { message: "Review and its image deleted successfully" };
  } catch (error) {
    dispatch(
      actionSetReviewError(
        "An unexpected error occurred while deleting the review and its image."
      )
    );
    throw error;
  }
};

// Initial State
const initialState = {
  reviews: {},
  reviewImages: {},
  users: {},
  error: null,
  userHasReview: false,
};

// Reducer
export default function reviewsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_REVIEWS:
      return {
        ...state,
        reviews: action.reviews.byId,
        reviewImages: action.images.byId,
        users: action.users.byId,
        userHasReview: true,
        error: null,
      };
    case ADD_REVIEW: {
      const newReviews = action.review
        ? { ...state.reviews, ...action.review.byId }
        : state.reviews;
      const newUsers = action.users
        ? { ...state.users, ...action.users.byId }
        : state.users;
      return {
        ...state,
        reviews: newReviews,
        users: newUsers,
      };
    }
    case UPLOAD_REVIEW_IMAGE: {
      console.log("Received ADD_REVIEW_IMAGE action:", action);
      const newReviewImages = {
        ...state.reviewImages,
        [action.reviewId]: action.imageUrl,
      };
      return {
        ...state,
        reviewImages: newReviewImages,
      };
    }

    case DELETE_REVIEW: {
      const newReviews = { ...state.reviews };
      delete newReviews[action.reviewId];
      return {
        ...state,
        reviews: newReviews,
        userHasReview: false,
      };
    }
    case DELETE_REVIEW_IMAGE: {
      const newReviewImages = { ...state.reviewImages };
      delete newReviewImages[action.imageId];
      return {
        ...state,
        reviewImages: newReviewImages,
      };
    }
    case SET_REVIEW_ERROR:
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}
