import React from 'react';
import './ProductList.css';

const ProductList = ({ products, onIncrease, onDecrease, onDelete, onMove }) => {
  return (
    <div className="product-list">
      {products.map(product => (
        <div key={product.id} className="product-item">
          <span>{product.name}</span>
          <span>{product.quantity}</span>
          <button onClick={() => onIncrease(product.id)}>+</button>
          <button onClick={() => onDecrease(product.id)}>-</button>
          <button onClick={() => onDelete(product.id)}>Delete</button>
          <button onClick={() => onMove(product.id)}>Move</button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;