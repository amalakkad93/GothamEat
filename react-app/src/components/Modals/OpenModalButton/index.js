import React from 'react';
import { useModal } from '../../../context/Modal';
import './OpenModalButton.css'

function OpenModalButton({
  modalComponent, // component to render inside the modal
  buttonText, // text of the button that opens the modal
  onButtonClick, // callback function that will be called once the button that opens the modal is clicked
  onModalClose, // callback function that will be called once the modal is closed
  sliding = false // if true, the modal will slide in from the bottom
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
    // <button className="more-info-button" onClick={onClick}>{buttonText}</button>
    <span className="more-info-text" onClick={onClick}>{buttonText}</span>
  );
}

export default OpenModalButton;
