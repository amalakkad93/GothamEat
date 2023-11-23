import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import "./SlidingModalRight.css";

export default function SlidingModalRight1({ isVisible, onClose, children }) {
  if (!isVisible) return null;

  return (
    <div className="modal-sidebar-overlay" onClick={onClose}>
      <div className="modal-sidebar-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-close-icon" onClick={onClose}><AiOutlineClose size={24} /></div>
        {children}
      </div>
    </div>
  );
}
