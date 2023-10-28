// reviews.js

import { csrfFetch } from "./csrf";

// Action Types
const SET_REVIEWS = "reviews/SET_REVIEWS";
const ADD_REVIEW = "reviews/ADD_REVIEW";
const SET_REVIEW_ERROR = "reviews/SET_REVIEW_ERROR";

// Action Creators
const actionSetReviews = (reviews, images, users) => ({
  type: SET_REVIEWS,
  reviews,
  images,
  users,
});

const actionAddReview = (review) => ({
  type: ADD_REVIEW,
  review,
});

const actionSetReviewError = (error) => ({
  type: SET_REVIEW_ERROR,
  error,
});

// Thunks
export const thunkGetReviewsByRestaurantId = (restaurantId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/restaurants/${restaurantId}/reviews`);

    if (response.ok) {
      const data = await response.json();
      dispatch(actionSetReviews(data.entities.reviews, data.entities.reviewImages, data.entities.users));
    } else {
      const data = await response.json();
      dispatch(actionSetReviewError(data.error));
    }
  } catch (error) {
    dispatch(actionSetReviewError("An unexpected error occurred while fetching the reviews."));
  }
};

export const thunkCreateReview = (restaurantId, reviewData) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/restaurants/${restaurantId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(actionAddReview(data.entities.reviews));
      return data.message;
    } else {
      const data = await response.json();
      dispatch(actionSetReviewError(data.error));
    }
  } catch (error) {
    dispatch(actionSetReviewError("An unexpected error occurred while creating the review."));
  }
};

// Initial State
const initialState = {
  reviews: {},
  reviewImages: {},
  users: {},
  error: null,
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
      };

    case ADD_REVIEW:
      return {
        ...state,
        reviews: {
          ...state.reviews,
          ...action.review.byId,
        },
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
