// src/components/MovePopup.js
import React from 'react';
import './MovePopup.css';

const MovePopup = ({ onClose, onMove, productId, currentLocation }) => {
  const otherLocations = ['kmStorage', 'keyserStorage', 'gfcCumberlandStorage'].filter(location => location !== currentLocation);

  return (
    <div className="move-popup">
      <div className="move-popup-content">
        <h3>Move Item</h3>
        <button onClick={() => onMove(productId, otherLocations[0])}>Move to {otherLocations[0]}</button>
        <button onClick={() => onMove(productId, otherLocations[1])}>Move to {otherLocations[1]}</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default MovePopup;