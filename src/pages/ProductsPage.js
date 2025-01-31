import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firebase
import ProductList from '../components/ProductList';
import SearchBar from '../components/SearchBar';
import ProductForm from '../components/ProductForm';
import MovePopup from '../components/MovePopup';
import ProductModal from '../components/ProductModal';
import AddExistingProductModal from '../components/AddExistingProductModal';
import AddProductToStorageModal from '../components/AddProductToStorageModal';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [kmStorageVisible, setKmStorageVisible] = useState(false);
  const [keyserStorageVisible, setKeyserStorageVisible] = useState(false);
  const [gfcStorageVisible, setGfcStorageVisible] = useState(false);
  const [movePopupVisible, setMovePopupVisible] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isProductFormVisible, setIsProductFormVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddExistingProductModalVisible, setIsAddExistingProductModalVisible] = useState(false);
  const [isAddProductToStorageModalVisible, setIsAddProductToStorageModalVisible] = useState(false);
  const [productToAdd, setProductToAdd] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          name: data.name || 'Unnamed Product', // Provide a default value for name
          quantities: data.quantities || { kmStorage: 0, keyserStorage: 0, gfcCumberlandStorage: 0 } // Provide default values for quantities
        };
      });
      setProducts(productsData);
    };

    fetchProducts();
  }, []);

  const handleIncrease = async (id, location) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, quantities: { ...product.quantities, [location]: (product.quantities[location] || 0) + 1 } } : product
    );
    setProducts(updatedProducts);

    // Update Firebase
    const productRef = doc(db, 'products', String(id)); // Ensure id is a string
    const productToUpdate = updatedProducts.find(p => p.id === id);
    await updateDoc(productRef, {
      quantities: productToUpdate.quantities
    });
  };

  const handleDecrease = async (id, location) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, quantities: { ...product.quantities, [location]: (product.quantities[location] || 0) - 1 } } : product
    );
    setProducts(updatedProducts);

    // Update Firebase
    const productRef = doc(db, 'products', String(id)); // Ensure id is a string
    const productToUpdate = updatedProducts.find(p => p.id === id);
    await updateDoc(productRef, {
      quantities: productToUpdate.quantities
    });
  };

  const handleAddProduct = async (newProduct, location) => {
    const docRef = await addDoc(collection(db, 'products'), {
      ...newProduct,
      quantities: {
        kmStorage: location === 'kmStorage' ? newProduct.quantity : 0,
        keyserStorage: location === 'keyserStorage' ? newProduct.quantity : 0,
        gfcCumberlandStorage: location === 'gfcCumberlandStorage' ? newProduct.quantity : 0,
      },
    });
    setProducts([...products, { id: docRef.id, ...newProduct }]);
  };

  const handleAddExistingProduct = (product) => {
    setProductToAdd(product);
    setIsAddExistingProductModalVisible(false);
    setIsAddProductToStorageModalVisible(true);
  };

  const handleConfirmAddProductToStorage = async (product, quantity, storageLocation) => {
    const updatedProducts = products.map(p =>
      p.id === product.id ? { ...p, quantities: { ...p.quantities, [storageLocation]: (p.quantities[storageLocation] || 0) + parseInt(quantity) } } : p
    );
    setProducts(updatedProducts);

    // Update Firebase
    const productRef = doc(db, 'products', String(product.id)); // Ensure product.id is a string
    try {
      const docSnapshot = await getDoc(productRef);
      if (docSnapshot.exists()) {
        await updateDoc(productRef, {
          quantities: updatedProducts.find(p => p.id === product.id).quantities
        });
      } else {
        // Create the document if it does not exist
        await setDoc(productRef, {
          quantities: updatedProducts.find(p => p.id === product.id).quantities
        });
        console.log(`Document created: ${productRef.path}`);
      }
    } catch (error) {
      console.error(`Error updating product: ${product.name}`, error);
    }

    setIsAddProductToStorageModalVisible(false);
  };

  const handleDeleteProduct = async (id, location) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        return {
          ...product,
          quantities: {
            ...product.quantities,
            [location]: 0,
          },
        };
      }
      return product;
    });
    setProducts(updatedProducts);

    // Update Firebase
    const productRef = doc(db, 'products', String(id)); // Ensure id is a string
    try {
      const docSnapshot = await getDoc(productRef);
      if (docSnapshot.exists()) {
        await updateDoc(productRef, {
          quantities: updatedProducts.find(p => p.id === id).quantities
        });
      } else {
        // Create the document if it does not exist
        await setDoc(productRef, {
          quantities: updatedProducts.find(p => p.id === id).quantities
        });
        console.log(`Document created: ${productRef.path}`);
      }
    } catch (error) {
      console.error(`Error updating product: ${id}`, error);
    }
  };

  const handleDeleteProductFromList = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(product => product.id !== id));
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product: ', error);
      alert('Failed to delete product');
    }
  };

  const handleMoveProduct = (id, location) => {
    setCurrentProductId(id);
    setCurrentLocation(location);
    setMovePopupVisible(true);
  };

  const handleMove = async (id, newLocation) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const quantityToMove = product.quantities[currentLocation];
        return {
          ...product,
          quantities: {
            ...product.quantities,
            [currentLocation]: 0,
            [newLocation]: (product.quantities[newLocation] || 0) + quantityToMove,
          },
        };
      }
      return product;
    });
    setProducts(updatedProducts);

    // Update Firebase
    const productRef = doc(db, 'products', String(id)); // Ensure id is a string
    const productToUpdate = updatedProducts.find(p => p.id === id);
    await updateDoc(productRef, {
      quantities: productToUpdate.quantities
    });

    setMovePopupVisible(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter out duplicate products based on name
  const uniqueProducts = Array.from(new Set(filteredProducts.map(product => product.name)))
    .map(name => {
      return filteredProducts.find(product => product.name === name);
    });

  return (
    <div className="products-page">
      <button className="show-form-button" onClick={() => setIsProductFormVisible(!isProductFormVisible)}>
        {isProductFormVisible ? 'Hide' : 'Add a New Product'}
      </button>
      {isProductFormVisible && <ProductForm addProduct={handleAddProduct} />}
      <button className="add-existing-product-button" onClick={() => setIsAddExistingProductModalVisible(true)}>
        Add Existing Product to Storage
      </button>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <div className="inventory-section">
        <h2>K&M Inventory</h2>
        <button onClick={() => setKmStorageVisible(!kmStorageVisible)}>
          {kmStorageVisible ? 'Hide' : 'Show'} K&M Inventory
        </button>
        {kmStorageVisible && (
          <ProductList
            products={uniqueProducts.filter(product => product.quantities.kmStorage > 0).map(product => ({ ...product, quantity: product.quantities.kmStorage }))}
            onIncrease={(id) => handleIncrease(id, 'kmStorage')}
            onDecrease={(id) => handleDecrease(id, 'kmStorage')}
            onDelete={(id) => handleDeleteProduct(id, 'kmStorage')}
            onMove={(id) => handleMoveProduct(id, 'kmStorage')}
            onProductClick={handleProductClick}
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
            products={uniqueProducts.filter(product => product.quantities.keyserStorage > 0).map(product => ({ ...product, quantity: product.quantities.keyserStorage }))}
            onIncrease={(id) => handleIncrease(id, 'keyserStorage')}
            onDecrease={(id) => handleDecrease(id, 'keyserStorage')}
            onDelete={(id) => handleDeleteProduct(id, 'keyserStorage')}
            onMove={(id) => handleMoveProduct(id, 'keyserStorage')}
            onProductClick={handleProductClick}
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
            products={uniqueProducts.filter(product => product.quantities.gfcCumberlandStorage > 0).map(product => ({ ...product, quantity: product.quantities.gfcCumberlandStorage }))}
            onIncrease={(id) => handleIncrease(id, 'gfcCumberlandStorage')}
            onDecrease={(id) => handleDecrease(id, 'gfcCumberlandStorage')}
            onDelete={(id) => handleDeleteProduct(id, 'gfcCumberlandStorage')}
            onMove={(id) => handleMoveProduct(id, 'gfcCumberlandStorage')}
            onProductClick={handleProductClick}
          />
        )}
      </div>

      {movePopupVisible && (
        <MovePopup
          onClose={() => setMovePopupVisible(false)}
          onMove={handleMove}
          productId={currentProductId}
          currentLocation={currentLocation}
        />
      )}

      <ProductModal product={selectedProduct} onClose={handleCloseModal} />

      {isAddExistingProductModalVisible && (
        <AddExistingProductModal
          products={products}
          onClose={() => setIsAddExistingProductModalVisible(false)}
          onAdd={handleAddExistingProduct}
          onDelete={handleDeleteProductFromList}
        />
      )}

      {isAddProductToStorageModalVisible && (
        <AddProductToStorageModal
          product={productToAdd}
          onClose={() => setIsAddProductToStorageModalVisible(false)}
          onConfirm={handleConfirmAddProductToStorage}
        />
      )}
    </div>
  );
};

export default ProductsPage;