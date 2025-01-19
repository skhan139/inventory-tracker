import React from 'react';
import './ProductItem.css';

const ProductItem = ({ product, onIncrease, onDecrease }) => {
  return (
    <div className="product-item">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-details">
        <span className="product-name">{product.name}</span>
        <span className="product-price">{product.price}</span>
        <span className="product-category">{product.category}</span>
        <div className="product-quantity">
          <button onClick={() => onDecrease(product.id)}>-</button>
          <span>{product.quantity || 0}</span>
          <button onClick={() => onIncrease(product.id)}>+</button>
        </div>
        <div className="product-inventory">
          <span>Total Inventory: {product.quantity || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;