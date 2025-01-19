import React from 'react';
import ProductItem from './ProductItem';
import './ProductList.css';

const ProductList = ({ products, onIncrease, onDecrease }) => {
  return (
    <div className="product-list">
      {products.map(product => (
        <ProductItem 
          key={product.id} 
          product={product}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
        />
      ))}
    </div>
  );
};

export default ProductList;