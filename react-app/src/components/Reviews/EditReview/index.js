import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../../context/Modal';
import {
  thunkGetReviewDetails,
  thunkUpdateReview,
  thunkGetReviewsByRestaurantId,
  actionUploadReviewImage, 
} from '../../../store/reviews';
import StarRatingInput from '../StarRatingInput';
import './EditReview.css';

export default function EditReview({
  reviewId,
  restaurantId,
  imageId,
  setReloadPage,
  // onReviewUpdate,
}) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  // const reviewData = useSelector(state => state.reviews.singleReview.byId[reviewId] || {});
  const fetchedReviewData = useSelector(state => state.reviews.singleReview.byId[reviewId]);

  const [review, setReview] = useState('');
  const [stars, setStars] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [initialReview, setInitialReview] = useState({});


  useEffect(() => {
    dispatch(thunkGetReviewDetails(reviewId, (fetchedData) => {
      setReview(fetchedData.review || '');
      setStars(fetchedData.stars || 0);
      setInitialReview(fetchedData);

    }));
  }, [dispatch, reviewId]);

  const handleUpdateReview = async (e) => {
    e.preventDefault();

    let updatedReviewData = {
      ...initialReview,
      review,
      stars,
    };

    try {
      await dispatch(thunkUpdateReview(reviewId, updatedReviewData, selectedImage, existingImageUrl));
      await dispatch(thunkGetReviewsByRestaurantId(restaurantId));
      closeModal();
      setReloadPage((prev) => !prev);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update the review.');
    }
  };

  return (
    <div className='edit-review-container'>
      <form onSubmit={handleUpdateReview} id="form-review">
      <h2 className="review-form-h2">Edit Your Review</h2>
      <div>{message && <div className="error">{message}</div>}</div>
        <textarea
          placeholder='Edit your review here...'
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <p className="star-container">
        <StarRatingInput rating={stars} onChange={setStars} />
        <span> Stars</span>
        </p>
        {/* {errors.stars && <div className="error">{errors.stars}</div>} */}
        <input type='file' onChange={(e) => setSelectedImage(e.target.files[0])} />
        {existingImageUrl && <img src={existingImageUrl} alt='Current Review' />}
        <button id="submit-review-btn"type='submit'>Update Review</button>
      </form>
    </div>
  );
}
