import React, { useRef, useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';
// import './SlidingModal.css';

const ModalContext = React.createContext();

export function ModalProvider({ children }) {
  const modalRef = useRef();
  const [modalContent, setModalContent] = useState(null);
  const [slidingModalContent, setSlidingModalContent] = useState(null);
   // callback function that will be called when modal is closing
  const [onModalClose, setOnModalClose] = useState(null);

  const closeModal = () => {
    setModalContent(null); // clear the modal contents
    setSlidingModalContent(null); // clear the sliding modal contents
    // If callback function is truthy, call the callback function and reset it
    // to null:
    if (typeof onModalClose === 'function') {
      setOnModalClose(null);
      onModalClose();
    }
  };

  const contextValue = {
    modalRef, // reference to modal div
    modalContent, // React component to render inside modal
    slidingModalContent, // React component to render inside sliding modal
    setModalContent, // function to set the React component to render inside modal
    setSlidingModalContent, // function to set the React component to render inside sliding modal
    setOnModalClose, // function to set the callback function called when modal is closing
    closeModal // function to close the modal
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <div ref={modalRef} />
    </ModalContext.Provider>
  );
}

export function Modal() {
  const { modalRef, modalContent, slidingModalContent, closeModal } = useContext(ModalContext);
  // If there is no div referenced by the modalRef or modalContent is not a
  // truthy value, render nothing:
  if (!modalRef || !modalRef.current) return null;

  if (modalContent) {
    // Render the following component to the div referenced by the modalRef
    return ReactDOM.createPortal(
      <div id="modal">
        <div id="modal-background" onClick={closeModal} />
        <div id="modal-content">{modalContent}</div>
      </div>,
      modalRef.current
    );
  } else if (slidingModalContent) {
    return ReactDOM.createPortal(
      <div className={`sliding-modal ${slidingModalContent ? 'visible' : ''}`}>
        <div className="sliding-modal-content">{slidingModalContent}</div>
        <button className="close-btn" onClick={closeModal}></button>
      </div>,
      modalRef.current
    );
  }

  return null;
}
export const useModal = () => useContext(ModalContext);
