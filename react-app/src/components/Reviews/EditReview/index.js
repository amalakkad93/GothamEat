import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../../context/Modal';
import {
  thunkGetReviewDetails,
  thunkUpdateReview,
  thunkGetReviewsByRestaurantId,
  actionUploadReviewImage, // Import if needed, depends on where you handle this
} from '../../../store/reviews';
import StarRatingInput from '../StarRatingInput';

export default function EditReview({
  reviewId,
  restaurantId,
  imageId,
  setReloadPage,
  // onReviewUpdate, // Uncomment if you have this callback implemented
}) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [reviewText, setReviewText] = useState('');
  const [stars, setStars] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(thunkGetReviewDetails(reviewId))
      .then((data) => {
        setReviewText(data.review);
        setStars(data.rating);
        setExistingImageUrl(data.imageUrl);
      })
      .catch((error) => {
        console.error(error);
        setMessage('Failed to load review details.');
      });
  }, [dispatch, reviewId]);

  const handleUpdateReview = async (e) => {
    e.preventDefault();

    let updatedReviewData = {
      review: reviewText,
      stars,
    };

    try {
      // Pass all necessary parameters to the thunk
      await dispatch(thunkUpdateReview(reviewId, updatedReviewData, selectedImage, existingImageUrl));

      // Assuming you want to refresh the reviews list
      await dispatch(thunkGetReviewsByRestaurantId(restaurantId));

      // Close the modal and trigger any necessary state updates
      closeModal();
      setReloadPage((prev) => !prev);
      // if (onReviewUpdate) {
      //   onReviewUpdate();
      // }
    } catch (error) {
      console.error(error);
      setMessage('Failed to update the review.');
    }
  };

  return (
    <div className='edit-review-container'>
      <form onSubmit={handleUpdateReview} id='form-edit-review'>
        <h2>Edit Your Review</h2>
        {message && <div className='error'>{message}</div>}
        <textarea
          placeholder='Edit your review here...'
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <StarRatingInput rating={stars} onChange={setStars} />
        <input type='file' onChange={(e) => setSelectedImage(e.target.files[0])} />
        {existingImageUrl && <img src={existingImageUrl} alt='Current Review' />}
        <button type='submit'>Update Review</button>
      </form>
    </div>
  );
}
