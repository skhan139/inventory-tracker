import React, { useState } from 'react';
import ProductList from '../components/ProductList';
import SearchBar from '../components/SearchBar';
import ProductForm from '../components/ProductForm';
import productsData from '../Products';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState(productsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [kmStorageVisible, setKmStorageVisible] = useState(true);
  const [keyserStorageVisible, setKeyserStorageVisible] = useState(true);
  const [gfcStorageVisible, setGfcStorageVisible] = useState(true);

  const handleIncrease = (id, location) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, quantities: { ...product.quantities, [location]: (product.quantities[location] || 0) + 1 } } : product
    ));
  };

  const handleDecrease = (id, location) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, quantities: { ...product.quantities, [location]: (product.quantities[location] || 0) - 1 } } : product
    ));
  };

  const handleAddProduct = (newProduct, location) => {
    setProducts([...products, {
      ...newProduct,
      quantities: {
        kmStorage: location === 'kmStorage' ? newProduct.quantity : 0,
        keyserStorage: location === 'keyserStorage' ? newProduct.quantity : 0,
        gfcCumberlandStorage: location === 'gfcCumberlandStorage' ? newProduct.quantity : 0,
      },
    }]);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-page">
      <ProductForm addProduct={handleAddProduct} />
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <div className="inventory-section">
        <h2>K&M Inventory</h2>
        <button onClick={() => setKmStorageVisible(!kmStorageVisible)}>
          {kmStorageVisible ? 'Hide' : 'Show'} K&M Inventory
        </button>
        {kmStorageVisible && (
          <ProductList
            products={filteredProducts.map(product => ({ ...product, quantity: product.quantities.kmStorage }))}
            onIncrease={(id) => handleIncrease(id, 'kmStorage')}
            onDecrease={(id) => handleDecrease(id, 'kmStorage')}
          />
        )}
      </div>

      <div className="inventory-section">
        <h2>Keyser Garage Inventory</h2>
        <button onClick={() => setKeyserStorageVisible(!keyserStorageVisible)}>
          {keyserStorageVisible ? 'Hide' : 'Show'} Keyser Garage Inventory
        </button>
        {keyserStorageVisible && (
          <ProductList
            products={filteredProducts.map(product => ({ ...product, quantity: product.quantities.keyserStorage }))}
            onIncrease={(id) => handleIncrease(id, 'keyserStorage')}
            onDecrease={(id) => handleDecrease(id, 'keyserStorage')}
          />
        )}
      </div>

      <div className="inventory-section">
        <h2>GFC Inventory</h2>
        <button onClick={() => setGfcStorageVisible(!gfcStorageVisible)}>
          {gfcStorageVisible ? 'Hide' : 'Show'} GFC Inventory
        </button>
        {gfcStorageVisible && (
          <ProductList
            products={filteredProducts.map(product => ({ ...product, quantity: product.quantities.gfcCumberlandStorage }))}
            onIncrease={(id) => handleIncrease(id, 'gfcCumberlandStorage')}
            onDecrease={(id) => handleDecrease(id, 'gfcCumberlandStorage')}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsPage;