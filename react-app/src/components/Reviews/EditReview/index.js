import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../../context/Modal';
import {
  thunkGetReviewDetails,
  thunkUpdateReview,
  thunkGetReviewsByRestaurantId,
  actionUploadReviewImage, // Import if needed, depends on where you handle this
} from '../../../store/reviews';
import StarRatingInput from '../StarRatingInput';
import './EditReview.css';

export default function EditReview({
  reviewId,
  restaurantId,
  imageId,
  setReloadPage,
  // onReviewUpdate, // Uncomment if you have this callback implemented
}) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  // const reviewData = useSelector(state => state.reviews.singleReview.byId[reviewId] || {});
  const fetchedReviewData = useSelector(state => state.reviews.singleReview.byId[reviewId]);
  // console.log("🚀 ~ file: index.js:23 ~ reviewData:", reviewData)
  const [review, setReview] = useState('');
  const [stars, setStars] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [initialReview, setInitialReview] = useState({});

  console.log("🚀 ~ file: index.js:29 ~   reviewId:",   reviewId)

  console.log("🚀 ~ file: index.js:30 ~  restaurantId:",  restaurantId)

  console.log("🚀 ~ file: index.js:31 ~ imageId:", imageId)


  // useEffect(() => {
  //   dispatch(thunkGetReviewDetails(reviewId))
  //     .then((data) => {
  //       console.log('Fetched review data:', data);

  //       if (data) {
  //         setReview(data.review || '');
  //         setStars(data.rating || 0);
  //         // setExistingImageUrl(data.imageUrl || '');
  //         setInitialReview(data);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Failed to load review details:', error);
  //       setMessage('Failed to load review details.');
  //     });
  // }, [dispatch, reviewId]);

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
