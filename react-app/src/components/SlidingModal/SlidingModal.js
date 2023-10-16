import React from 'react';
import './SlidingModal.css';

export default function SlidingModal({ isVisible, onClose, children }) {
    return (
        <div className={`sliding-modal ${isVisible ? 'visible' : ''}`}>
            <div className="sliding-modal-content">
                {children}
            </div>
            <button className="close-btn" onClick={onClose}>X</button>
        </div>
    );
}


