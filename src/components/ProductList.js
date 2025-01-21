// src/components/ProductList.js
import React from 'react';
import './ProductList.css';

const ProductList = ({ products, onIncrease, onDecrease, onDelete }) => {
  return (
    <div className="product-list">
      {products.map(product => (
        <div key={product.id} className="product-item">
          <span>{product.name}</span>
          <span>{product.quantity}</span>
          <button onClick={() => onIncrease(product.id)}>+</button>
          <button onClick={() => onDecrease(product.id)}>-</button>
          <button onClick={() => onDelete(product.id)}>Delete</button> {/* Add this line */}
        </div>
      ))}
    </div>
  );
};

export default ProductList;