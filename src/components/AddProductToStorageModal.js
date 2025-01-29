// src/components/AddProductToStorageModal.js
import React, { useState } from 'react';
import './AddProductToStorageModal.css';

const AddProductToStorageModal = ({ product, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(0);
  const [storageLocation, setStorageLocation] = useState('');

  const handleConfirm = () => {
    onConfirm(product, quantity, storageLocation);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Add {product.name} to Storage</h2>
        <label>
          Quantity:
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        <label>
          Storage Location:
          <select value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)}>
            <option value="">Select a location</option>
            <option value="kmStorage">K&M Storage</option>
            <option value="keyserStorage">Keyser Storage</option>
            <option value="gfcCumberlandStorage">GFC Cumberland Storage</option>
          </select>
        </label>
        <button onClick={handleConfirm}>Confirm</button>
      </div>
    </div>
  );
};

export default AddProductToStorageModal;