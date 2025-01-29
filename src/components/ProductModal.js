import React from 'react';
import './ProductModal.css';

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{product.name}</h2>
        <p>Price: ${product.price}</p>
        <p>Description: {product.description}</p>
        <p>Quantity: {product.quantity}</p>
      </div>
    </div>
  );
};

export default ProductModal;