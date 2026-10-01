import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import ProductList from '../components/ProductList';
import SearchBar from '../components/SearchBar';
import ProductForm from '../components/ProductForm';
import MovePopup from '../components/MovePopup';
import ProductModal from '../components/ProductModal';
import AddExistingProductModal from '../components/AddExistingProductModal';
import AddProductToStorageModal from '../components/AddProductToStorageModal';
import './ProductsPage.css';

const STORAGE_LOCATIONS = [
  {
    key: 'kmStorage',
    name: 'K&M Inventory',
    description: 'Primary K&M product storage',
  },
  {
    key: 'keyserStorage',
    name: 'Keyser Garage Inventory',
    description: 'Products currently held at the Keyser garage',
  },
  {
    key: 'gfcCumberlandStorage',
    name: 'GFC Inventory',
    description: 'GFC Cumberland product inventory',
  },
];

const EMPTY_QUANTITIES = {
  kmStorage: 0,
  keyserStorage: 0,
  gfcCumberlandStorage: 0,
};

const normalizeProduct = (id, product = {}) => ({
  id,
  ...product,
  name: product.name?.trim() || 'Unnamed Product',
  quantities: {
    ...EMPTY_QUANTITIES,
    ...(product.quantities || {}),
  },
});

const toNonNegativeInteger = (value) => {
  const quantity = Number.parseInt(value, 10);
  return Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleStorage, setVisibleStorage] = useState({});
  const [isProductFormVisible, setIsProductFormVisible] = useState(false);
  const [moveDetails, setMoveDetails] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddExistingProductModalVisible, setIsAddExistingProductModalVisible] =
    useState(false);
  const [productToAdd, setProductToAdd] = useState(null);
  const [isAddProductToStorageModalVisible, setIsAddProductToStorageModalVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState(null);

  const showMessage = useCallback((type, text) => {
    setPageMessage({ type, text });
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productData = querySnapshot.docs.map((productDocument) =>
          normalizeProduct(productDocument.id, productDocument.data()),
        );

        if (isActive) {
          setProducts(productData);
        }
      } catch (error) {
        console.error('Unable to load products:', error);
        if (isActive) {
          showMessage('error', 'Inventory could not be loaded. Please refresh and try again.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [showMessage]);

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();

    return products.filter((product) =>
      product.name.toLocaleLowerCase().includes(normalizedSearchTerm),
    );
  }, [products, searchTerm]);

  const storageSummaries = useMemo(() => {
    return STORAGE_LOCATIONS.reduce((summaries, location) => {
      const productsAtLocation = filteredProducts
        .filter((product) => toNonNegativeInteger(product.quantities[location.key]) > 0)
        .map((product) => ({
          ...product,
          quantity: toNonNegativeInteger(product.quantities[location.key]),
        }));

      summaries[location.key] = {
        products: productsAtLocation,
        productCount: productsAtLocation.length,
        unitCount: productsAtLocation.reduce(
          (total, product) => total + product.quantity,
          0,
        ),
      };

      return summaries;
    }, {});
  }, [filteredProducts]);

  const updateProductQuantities = useCallback((productId, quantities) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId ? { ...product, quantities } : product,
      ),
    );
  }, []);

  const adjustQuantity = useCallback(
    async (productId, location, change) => {
      const productRef = doc(db, 'products', String(productId));

      try {
        const quantities = await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(productRef);

          if (!snapshot.exists()) {
            throw new Error('Product no longer exists.');
          }

          const currentQuantities = {
            ...EMPTY_QUANTITIES,
            ...(snapshot.data().quantities || {}),
          };
          const nextQuantity = Math.max(
            0,
            toNonNegativeInteger(currentQuantities[location]) + change,
          );
          const nextQuantities = {
            ...currentQuantities,
            [location]: nextQuantity,
          };

          transaction.update(productRef, { quantities: nextQuantities });
          return nextQuantities;
        });

        updateProductQuantities(productId, quantities);
      } catch (error) {
        console.error('Unable to update quantity:', error);
        showMessage('error', 'The quantity could not be updated. Please try again.');
      }
    },
    [showMessage, updateProductQuantities],
  );

  const handleAddProduct = useCallback(
    async (newProduct, location) => {
      const productName = newProduct.name?.trim();
      const quantity = toNonNegativeInteger(newProduct.quantity);

      if (!productName) {
        showMessage('error', 'A product name is required.');
        return;
      }

      const productData = {
        ...newProduct,
        name: productName,
        quantity,
        quantities: {
          ...EMPTY_QUANTITIES,
          [location]: quantity,
        },
      };

      try {
        const documentReference = await addDoc(collection(db, 'products'), productData);
        setProducts((currentProducts) => [
          ...currentProducts,
          normalizeProduct(documentReference.id, productData),
        ]);
        setIsProductFormVisible(false);
        showMessage('success', `${productName} was added to inventory.`);
      } catch (error) {
        console.error('Unable to add product:', error);
        showMessage('error', 'The product could not be added. Please try again.');
      }
    },
    [showMessage],
  );

  const handleAddExistingProduct = useCallback((product) => {
    setProductToAdd(product);
    setIsAddExistingProductModalVisible(false);
    setIsAddProductToStorageModalVisible(true);
  }, []);

  const handleConfirmAddProductToStorage = useCallback(
    async (product, quantity, storageLocation) => {
      const amountToAdd = toNonNegativeInteger(quantity);

      if (!product?.id || amountToAdd < 1) {
        showMessage('error', 'Choose a product and enter a quantity greater than zero.');
        return;
      }

      const productRef = doc(db, 'products', String(product.id));

      try {
        const quantities = await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(productRef);

          if (!snapshot.exists()) {
            throw new Error('Product no longer exists.');
          }

          const currentQuantities = {
            ...EMPTY_QUANTITIES,
            ...(snapshot.data().quantities || {}),
          };
          const nextQuantities = {
            ...currentQuantities,
            [storageLocation]:
              toNonNegativeInteger(currentQuantities[storageLocation]) + amountToAdd,
          };

          transaction.update(productRef, { quantities: nextQuantities });
          return nextQuantities;
        });

        updateProductQuantities(product.id, quantities);
        setIsAddProductToStorageModalVisible(false);
        setProductToAdd(null);
        showMessage('success', `${amountToAdd} unit(s) of ${product.name} were added.`);
      } catch (error) {
        console.error('Unable to add product to storage:', error);
        showMessage('error', 'The inventory could not be updated. Please try again.');
      }
    },
    [showMessage, updateProductQuantities],
  );

  const clearProductFromStorage = useCallback(
    async (productId, location) => {
      const productRef = doc(db, 'products', String(productId));

      try {
        const quantities = await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(productRef);

          if (!snapshot.exists()) {
            throw new Error('Product no longer exists.');
          }

          const nextQuantities = {
            ...EMPTY_QUANTITIES,
            ...(snapshot.data().quantities || {}),
            [location]: 0,
          };

          transaction.update(productRef, { quantities: nextQuantities });
          return nextQuantities;
        });

        updateProductQuantities(productId, quantities);
      } catch (error) {
        console.error('Unable to clear product quantity:', error);
        showMessage('error', 'The product could not be removed from this location.');
      }
    },
    [showMessage, updateProductQuantities],
  );

  const handleDeleteProductFromList = useCallback(
    async (productId) => {
      const product = products.find(({ id }) => id === productId);
      const shouldDelete = window.confirm(
        `Permanently delete ${product?.name || 'this product'} from every location?`,
      );

      if (!shouldDelete) {
        return;
      }

      try {
        await deleteDoc(doc(db, 'products', String(productId)));
        setProducts((currentProducts) =>
          currentProducts.filter(({ id }) => id !== productId),
        );
        showMessage('success', 'The product was permanently deleted.');
      } catch (error) {
        console.error('Unable to delete product:', error);
        showMessage('error', 'The product could not be deleted. Please try again.');
      }
    },
    [products, showMessage],
  );

  const handleMoveProduct = useCallback((productId, location) => {
    setMoveDetails({ productId, location });
  }, []);

  const handleMove = useCallback(
    async (productId, newLocation) => {
      if (!moveDetails || newLocation === moveDetails.location) {
        setMoveDetails(null);
        return;
      }

      const productRef = doc(db, 'products', String(productId));

      try {
        const quantities = await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(productRef);

          if (!snapshot.exists()) {
            throw new Error('Product no longer exists.');
          }

          const currentQuantities = {
            ...EMPTY_QUANTITIES,
            ...(snapshot.data().quantities || {}),
          };
          const quantityToMove = toNonNegativeInteger(
            currentQuantities[moveDetails.location],
          );
          const nextQuantities = {
            ...currentQuantities,
            [moveDetails.location]: 0,
            [newLocation]:
              toNonNegativeInteger(currentQuantities[newLocation]) + quantityToMove,
          };

          transaction.update(productRef, { quantities: nextQuantities });
          return nextQuantities;
        });

        updateProductQuantities(productId, quantities);
        setMoveDetails(null);
        showMessage('success', 'Inventory was moved successfully.');
      } catch (error) {
        console.error('Unable to move inventory:', error);
        showMessage('error', 'The inventory could not be moved. Please try again.');
      }
    },
    [moveDetails, showMessage, updateProductQuantities],
  );

  const toggleStorage = useCallback((storageKey) => {
    setVisibleStorage((currentVisibility) => ({
      ...currentVisibility,
      [storageKey]: !currentVisibility[storageKey],
    }));
  }, []);

  return (
    <main className="products-page">
      <header className="products-page-header">
        <div>
          <p className="eyebrow">Inventory workspace</p>
          <h1>Products</h1>
          <p className="page-introduction">
            Track stock, move products, and manage quantities across every location.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={() => setIsAddExistingProductModalVisible(true)}
          >
            Add existing product
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={() => setIsProductFormVisible((isVisible) => !isVisible)}
            aria-expanded={isProductFormVisible}
          >
            {isProductFormVisible ? 'Close product form' : 'Add new product'}
          </button>
        </div>
      </header>

      {pageMessage && (
        <div
          className={`page-message page-message-${pageMessage.type}`}
          role={pageMessage.type === 'error' ? 'alert' : 'status'}
        >
          <span>{pageMessage.text}</span>
          <button type="button" onClick={() => setPageMessage(null)} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      {isProductFormVisible && (
        <section className="product-form-panel" aria-label="Add a new product">
          <ProductForm addProduct={handleAddProduct} />
        </section>
      )}

      <section className="inventory-search" aria-label="Search inventory">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </section>

      {isLoading ? (
        <p className="inventory-status">Loading inventory…</p>
      ) : (
        <div className="inventory-grid">
          {STORAGE_LOCATIONS.map((location) => {
            const summary = storageSummaries[location.key];
            const isVisible = Boolean(visibleStorage[location.key]);
            const panelId = `${location.key}-inventory`;

            return (
              <section key={location.key} className="inventory-section">
                <div className="inventory-section-header">
                  <div>
                    <p>{location.description}</p>
                    <h2>{location.name}</h2>
                  </div>
                  <div className="inventory-metrics" aria-label={`${location.name} summary`}>
                    <span><strong>{summary.productCount}</strong> products</span>
                    <span><strong>{summary.unitCount}</strong> games</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="inventory-toggle"
                  onClick={() => toggleStorage(location.key)}
                  aria-expanded={isVisible}
                  aria-controls={panelId}
                >
                  {isVisible ? 'Hide inventory' : 'View inventory'}
                </button>

                {isVisible && (
                  <div id={panelId} className="inventory-panel">
                    {summary.products.length ? (
                      <ProductList
                        products={summary.products}
                        onIncrease={(id) => adjustQuantity(id, location.key, 1)}
                        onDecrease={(id) => adjustQuantity(id, location.key, -1)}
                        onDelete={(id) => clearProductFromStorage(id, location.key)}
                        onMove={(id) => handleMoveProduct(id, location.key)}
                        onProductClick={setSelectedProduct}
                      />
                    ) : (
                      <p className="empty-location">
                        {searchTerm
                          ? 'No matching products at this location.'
                          : 'No products are currently stored here.'}
                      </p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {moveDetails && (
        <MovePopup
          onClose={() => setMoveDetails(null)}
          onMove={handleMove}
          productId={moveDetails.productId}
          currentLocation={moveDetails.location}
        />
      )}

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

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
          onClose={() => {
            setIsAddProductToStorageModalVisible(false);
            setProductToAdd(null);
          }}
          onConfirm={handleConfirmAddProductToStorage}
        />
      )}
    </main>
  );
};

export default ProductsPage;
