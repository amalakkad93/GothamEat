import React from 'react';
import './SlidingModalRight.css';

export default function SlidingModalRight({ isVisible, onClose, children }) {
  return (
    <div className={`sliding-modal-Right ${isVisible ? 'visible' : ''}`}>
      <div className="sliding-modal-backdrop-Right" onClick={onClose}></div>
      <div className="sliding-modal-content">
        {children}
      </div>
      <button className="close-btn" onClick={onClose}>✕</button>
    </div>
  );
}
