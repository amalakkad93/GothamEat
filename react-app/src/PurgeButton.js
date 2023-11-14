// PurgeButton.js
import React from 'react';

const PurgeButton = ({ onPurge }) => {
  return (
    <button onClick={onPurge}>Purge Persisted State</button>
  );
};

export default PurgeButton;
