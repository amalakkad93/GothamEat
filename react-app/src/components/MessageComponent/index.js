import React from 'react';
import './MessageComponent.css';

const MessageComponent = ({ show, onClose, message }) => {
  if (!show) return null;

  return (
    <div className="modal-message-backdrop">
      <div className="modal-message">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default MessageComponent;
