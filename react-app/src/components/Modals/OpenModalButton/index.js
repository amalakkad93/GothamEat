import React from 'react';
import { useModal } from '../../../context/Modal';
import './OpenModalButton.css'

function OpenModalButton({
  modalComponent, // component to render inside the modal
  buttonText, // text of the button that opens the modal
  onButtonClick, // optional: callback function that will be called once the button that opens the modal is clicked
  onModalClose, // optional: callback function that will be called once the modal is closed
  sliding = false // optional: if true, the modal will slide in from the bottom
}) {
  const { setModalContent, setSlidingModalContent, setOnModalClose } = useModal();

  const onClick = () => {
    if (onModalClose) setOnModalClose(onModalClose);
    if (sliding) {
      setSlidingModalContent(modalComponent);
    } else {
      setModalContent(modalComponent);
    }
    if (onButtonClick) onButtonClick();
  };

  return (
    <button className="post-delete-review-btn" onClick={onClick}>{buttonText}</button>
  );
}

export default OpenModalButton;
