import React, { useState } from 'react';
import './ProductForm.css';

const ProductForm = ({ addProduct }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('kmStorage');

  const handleSubmit = (e) => {
    e.preventDefault();
    addProduct({
      id: Date.now(),
      name,
      quantity,
      price,
      category,
      image,
    }, location);
    setName('');
    setQuantity(0);
    setPrice('');
    setCategory('');
    setImage('');
    setLocation('kmStorage');
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        required
      />
      <input
        type="text"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        required
      />
      <select value={location} onChange={(e) => setLocation(e.target.value)} required>
        <option value="kmStorage">K and M Storage</option>
        <option value="keyserStorage">Keyser Garage</option>
        <option value="gfcCumberlandStorage">GFC/Cumberland</option>
      </select>
      <button type="submit">Add Product</button>
    </form>
  );
};

export default ProductForm;