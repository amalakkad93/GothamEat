import React from 'react';

function DeletePaymentButton({ onDelete }) {
  return (
    <button onClick={onDelete}>Delete</button>
  );
}

export default DeletePaymentButton ;
