import React from 'react';
import './ProductModal.css';

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{product.name}</h2>
        <p>Price: ${product.price || 'N/A'}</p>
        <p>Description: {product.description || 'N/A'}</p>
        <p>Quantity: {product.quantity || 'N/A'}</p>
        <p>Category: {product.category || 'N/A'}</p>
        <p>Tags: {product.tags ? product.tags.join(', ') : 'N/A'}</p>
        <p>Take In: {product.takeIn || 'N/A'}</p>
        <p>Payout: {product.payout || 'N/A'}</p>
        <p>Profit: {product.profit || 'N/A'}</p>
        <p>Profit Percent: {product.profitPercent || 'N/A'}</p>
        <p>Deals Per Case: {product.dealsPerCase || 'N/A'}</p>
        <p>Quantities:</p>
        <ul>
          <li>KM Storage: {product.quantities?.kmStorage || 0}</li>
          <li>Keyser Storage: {product.quantities?.keyserStorage || 0}</li>
          <li>GFC Cumberland Storage: {product.quantities?.gfcCumberlandStorage || 0}</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductModal;