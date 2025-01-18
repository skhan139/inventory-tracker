// src/pages/ProductsPage.js
import React, { useState } from 'react';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);

  const addProduct = (product) => {
    setProducts([...products, product]);
  };

  return (
    <div>
      <ProductForm addProduct={addProduct} />
      <ProductList products={products} />
    </div>
  );
};

export default ProductsPage;