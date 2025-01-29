// src/components/AddExistingProductModal.js
import React from 'react';
import './AddExistingProductModal.css';

const AddExistingProductModal = ({ products, onClose, onAdd }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Select a Product to Add to Storage</h2>
        <ul>
          {products.map(product => (
            <li key={product.id}>
              <span>{product.name}</span>
              <button onClick={() => onAdd(product)}>Add to Storage</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddExistingProductModal;