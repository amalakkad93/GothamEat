import React from 'react';
import './ModalMessage.css';

const ModalMessage = ({ type, message, onClose, duration = 3000 }) => {
  return (
    <div className={`modal-message ${type}`}>
      <div className="progress-bar" style={{ animationDuration: `${duration}ms` }}></div>
      <p>{message}</p>
      {/* <button onClick={onClose}>Close</button> */}
    </div>
  );
};


export default ModalMessage;
