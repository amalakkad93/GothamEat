import React from 'react';
import '../../context/Modal.css';

export default function SlidingModal({ isVisible, onClose, children }) {
  return (
      <div className={`sliding-modal ${isVisible ? 'visible' : ''}`}>
          <div className="sliding-modal-backdrop" onClick={onClose}></div>
          <div className="sliding-modal-content">
              {children}
          </div>
          <button className="close-btn" onClick={onClose}></button>
      </div>
  );
}


// export default function SlidingModal({ isVisible, onClose, children }) {
//   console.log("SlidingModal render check:", isVisible);
//     return (
//         <div className={`sliding-modal ${isVisible ? 'visible' : ''}`}>
//             <div className="sliding-modal-content">
//                 {children}
//             </div>
//             <button className="close-btn" onClick={onClose}></button>
//         </div>
//     );
// }
