import React, { useState } from 'react';
import './ClearCartModal.css';
export default function ClearCartModal({ onClearCart, onAddItems, modalVisible }) {
  return (
    <div className={`modal ${modalVisible ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-body">
          <button onClick={onAddItems} className="btn-add-items">
            <i className="fas fa-plus" style={{ color: 'black' }}></i>
            Add items
          </button>
          
          <button onClick={onClearCart} className="btn-clear-cart">
            <i className="fas fa-trash-alt" style={{ color: 'red' }}></i>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
