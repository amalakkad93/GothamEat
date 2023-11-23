import { csrfFetch } from "./csrf";

// Action Types
const SET_REVIEWS = "reviews/SET_REVIEWS";
const GET_SINGLE_REVIEW = "reviews/GET_SINGLE_REVIEW";
const ADD_REVIEW = "reviews/ADD_REVIEW";
const UPLOAD_REVIEW_IMAGE = "reviews/UPLOAD_REVIEW_IMAGE";
const DELETE_REVIEW = "reviews/DELETE_REVIEW";
const DELETE_REVIEW_IMAGE = "reviews/DELETE_REVIEW_IMAGE";
const SET_REVIEW_ERROR = "reviews/SET_REVIEW_ERROR";
export const UPDATE_REVIEW_SUCCESS = "UPDATE_REVIEW_SUCCESS";
const USER_HAS_POSTED_REVIEW = "USER_HAS_POSTED_REVIEW";

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

const actionUploadReviewImage = (imageId, imageUrl, reviewId) => {
  return {
    type: "UPLOAD_REVIEW_IMAGE",
    payload: { imageId, imageUrl, reviewId },
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

// Action creator for successful review update
export function actionUpdateReviewSuccess(message) {
  return {
    type: UPDATE_REVIEW_SUCCESS,
    payload: message,
  };
}

const actionSetReviewError = (error) => ({
  type: SET_REVIEW_ERROR,
  error,
});

const actionGetSingleReview = (review) => ({
  type: "GET_SINGLE_REVIEW",
  review,
});

// Action creator for user has posted review
const actionHasUserPostedReview = () => ({
  type: USER_HAS_POSTED_REVIEW,
});

// The thunk for fetching review details
export const thunkGetReviewDetails =
  (reviewId, callback) => async (dispatch) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`);
      const data = await response.json();
      if (response.ok) {
        const { byId, allIds } = data;

        const review = byId[allIds[0]];
        dispatch(actionGetSingleReview(review));
        callback(review);
      } else {
        console.error(
          `Error fetching details for review with ID ${reviewId}:`,
          data
        );
        dispatch(
          actionSetReviewError(
            data.error ||
              `Error fetching details for review with ID ${reviewId}.`
          )
        );
      }
    } catch (error) {
      console.error(
        `An error occurred while fetching details for review with ID ${reviewId}:`,
        error
      );
      dispatch(
        actionSetReviewError(
          `An error occurred while fetching details for review with ID ${reviewId}.`
        )
      );
    }
  };

// Thunks
export const thunkGetReviewsByRestaurantId =
  (restaurantId) => async (dispatch) => {
    try {

      const response = await csrfFetch(
        `/api/restaurants/${restaurantId}/reviews`
      );
      const data = await response.json();
      if (response.ok) {
        dispatch(
          actionSetReviews(
            data.entities.reviews || {},
            data.entities.reviewImages || {},
            data.entities.users || {}
          )
        );
      } else {
        console.error("Server responded with error:", data.error);
        dispatch(actionSetReviewError(data.error));
      }
    } catch (error) {
      console.error("Error while fetching reviews:", error);
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
        dispatch(actionHasUserPostedReview());
        if (image && reviewData.reviewId) {
          // 2. Fetch the presigned URL
          const presignedResponse = await csrfFetch(
            `/s3/generate_presigned_url?filename=${image.name}&contentType=${image.type}`
          );

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
            actionUploadReviewImage(reviewData.reviewId, presignedData.file_url)
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

// ***************************************************************
//  Thunk to Update a Review
// ***************************************************************
export const thunkUpdateReview = (
  reviewId,
  updatedData,
  newImage,
  existingImageUrl
) => {
  return async (dispatch) => {
    try {
      // Delete existing image
      if (existingImageUrl) {
        const deleteResponse = await csrfFetch("/s3/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: existingImageUrl }),
        });

        if (!deleteResponse.ok) {
          const data = await deleteResponse.json();
          dispatch(actionSetReviewError(data.error));
          throw new Error(data.error);
        }
      }

      // Update review details
      const reviewResponse = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!reviewResponse.ok) {
        const data = await reviewResponse.json();
        dispatch(actionSetReviewError(data.error));
        throw new Error(data.error);
      }

      const updatedReviewData = await reviewResponse.json();

      // If there's a new image to upload
      if (newImage) {
        // Get presigned URL from the server
        const presignedResponse = await csrfFetch(
          `/s3/generate_presigned_url?filename=${encodeURIComponent(
            newImage.name
          )}&contentType=${encodeURIComponent(newImage.type)}`
        );

        if (!presignedResponse.ok) {
          const data = await presignedResponse.json();
          dispatch(actionSetReviewError(data.error));
          throw new Error(data.error);
        }

        const presignedData = await presignedResponse.json();
        const { presigned_url, file_url } = presignedData;

        // Upload the image to S3
        const s3Response = await fetch(presigned_url, {
          method: "PUT",
          body: newImage,
          headers: {
            "Content-Type": newImage.type,
          },
        });

        if (!s3Response.ok) {
          throw new Error("Failed to upload image to S3.");
        }

        // Update the image URL in the application's backend
        const updateImageResponse = await csrfFetch(
          `/api/reviews/${reviewId}/images`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_url: file_url }),
          }
        );

        if (!updateImageResponse.ok) {
          const errorData = await updateImageResponse.json();
          dispatch(actionSetReviewError(errorData.error));
          throw new Error(errorData.error);
        }

        const updateImageData = await updateImageResponse.json();
        if (updateImageData.status === "success") {
          dispatch(
            actionUploadReviewImage(
              updateImageData.id,
              updateImageData.image_url,
              reviewId
            )
          );
        }
      }

      // Return a success message
      return { message: "Review updated successfully" };
    } catch (error) {
      dispatch(
        actionSetReviewError(
          error.message ||
            "An unexpected error occurred while updating the review."
        )
      );
      throw error;
    }
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

    // Delete the review image
    if (imageId) {
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
  singleReview: { byId: {}, allIds: [] },
  reviews: {},
  // reviewImages: {},
  reviewImages: { byId: {}, allIds: [] },
  users: {},
  error: null,
  userHasReview: false,
};

// Reducer
export default function reviewsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_SINGLE_REVIEW:
      console.log("Updating state with review:", action.review);
      return {
        ...state,
        singleReview: {
          byId: { [action.review.id]: action.review },
          allIds: [action.review.id],
        },
      };
    case SET_REVIEWS:
      return {
        ...state,
        reviews: {
          byId: action.reviews.byId,
          allIds: action.reviews.allIds,
        },
        reviewImages: {
          byId: action.images.byId,
          allIds: action.images.allIds,
        },
        users: {
          byId: action.users.byId,
          allIds: action.users.allIds,
        },
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
      const { imageId, imageUrl, reviewId } = action.payload;

      // Update reviewImages state
      const newReviewImages = {
        ...state.reviewImages,
        byId: {
          ...state.reviewImages.byId,
          [imageId]: { imageUrl, reviewId },
        },
        allIds: state.reviewImages.allIds.includes(imageId)
          ? state.reviewImages.allIds
          : [...state.reviewImages.allIds, imageId],
      };

      // Update the specific review's image in reviews
      const review = state.reviews[reviewId];
      if (review) {
        const updatedReview = {
          ...review,
          imageId,
        };

        // Update the state with the new review details
        const updatedReviews = {
          ...state.reviews,
          [reviewId]: updatedReview,
        };

        return {
          ...state,
          reviewImages: newReviewImages,
          reviews: updatedReviews,
        };
      } else {
        // If the review doesn't exist, update the reviewImages state
        return {
          ...state,
          reviewImages: newReviewImages,
        };
      }
    }

    case DELETE_REVIEW: {
      const { [action.reviewId]: _, ...newById } = state.reviews.byId;
      const newAllIds = state.reviews.allIds.filter(
        (id) => id !== action.reviewId
      );

      return {
        ...state,
        reviews: {
          ...state.reviews,
          byId: newById,
          allIds: newAllIds,
        },
        userHasReview: false,
      };
    }
    case DELETE_REVIEW_IMAGE: {
      const newReviewImages = { ...state.reviewImages.byId };
      delete newReviewImages[action.imageId];
      return {
        ...state,
        reviewImages: {
          ...state.reviewImages,
          byId: newReviewImages,
          allIds: state.reviewImages.allIds.filter(
            (id) => id !== action.imageId
          ),
        },
      };
    }
    case USER_HAS_POSTED_REVIEW:
      return {
        ...state,
        userHasReview: true,
      };

    case SET_REVIEW_ERROR:
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}
