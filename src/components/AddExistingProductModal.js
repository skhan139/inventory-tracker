import React, { useState } from 'react';
import './AddExistingProductModal.css';

const AddExistingProductModal = ({ products, onClose, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await onDelete(productToDelete.id);
      setProductToDelete(null); // Reset the product to delete
    } catch (error) {
      console.error('Error deleting product: ', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Select a Product to Add to Storage</h2>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredProducts.map(product => (
            <li key={product.id}>
              <span>{product.name}</span>
              <button onClick={() => onAdd(product)}>Add to Storage</button>
              <button className="delete" onClick={() => setProductToDelete(product)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      {productToDelete && (
        <div className="confirmation-modal">
          <div className="confirmation-modal-content">
            <p>Are you sure you want to delete this product?</p>
            <button onClick={handleDelete}>Yes</button>
            <button className="delete" onClick={() => setProductToDelete(null)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExistingProductModal;