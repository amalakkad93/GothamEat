import React from 'react';
import { AiOutlineClose } from 'react-icons/ai'; // Import the close icon
import "./SlidingModalRight1.css";

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

// import React, { useState } from 'react';
// import "./SlidingModalRight1.css";

// export default function SlidingModalRight1({ isVisible, onClose, children }) {
//   if (!isVisible) return null;

//   return (
//     <div className="modal-sidebar-overlay" onClick={onClose}>
//       <div className="modal-sidebar-content" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-close-icon" onClick={onClose}>X</div>
//         {children}
//         {/* <button onClick={onClose} className="modal-sidebar-close-btn">X</button> */}

//       </div>
//     </div>
//   );
// }

// // Encapsulating the code within a document ready function to ensure
// // DOM elements are fully loaded before the script runs.
// document.addEventListener('DOMContentLoaded', () => {
//   const burger = document.querySelector('.burger');
//   const nav = document.querySelector('.nav-links');
//   const navLinks = document.querySelectorAll('.nav-links a');

//   // Function to toggle nav
//   const toggleNav = () => {
//     nav.classList.toggle('nav-active');
//     burger.classList.toggle('toggle');
//   };

//   // Function to animate links
//   const animateLinks = () => {
//     navLinks.forEach((link, index) => {
//       link.style.animation = link.style.animation ?
//         '' : `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`;
//     });
//   };

//   // Event listeners
//   burger.addEventListener('click', () => {
//     toggleNav();
//     animateLinks();
//   });
// });
