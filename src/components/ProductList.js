import React from 'react';
import './ProductList.css';

const ProductList = ({ products, onIncrease, onDecrease, onDelete, onMove, onProductClick }) => {
  return (
    <div className="product-list">
      {products.map(product => (
        <div key={product.id} className="product-item" onClick={() => onProductClick(product)}>
          <span>{product.name}</span>
          <span>{product.quantity}</span>
          <button onClick={(e) => { e.stopPropagation(); onIncrease(product.id); }}>+</button>
          <button onClick={(e) => { e.stopPropagation(); onDecrease(product.id); }}>-</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}>Delete</button>
          <button onClick={(e) => { e.stopPropagation(); onMove(product.id); }}>Move</button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;