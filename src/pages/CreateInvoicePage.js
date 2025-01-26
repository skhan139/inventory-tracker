// src/pages/CreateInvoicePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import './CreateInvoicePage.css';

const CreateInvoicePage = () => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [customerLocation, setCustomerLocation] = useState('');
  const [products, setProducts] = useState([{ name: '', quantity: 1, serialNumbers: [''], unitPrice: 0 }]);
  const [tax, setTax] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const { addInvoice } = useInvoices();
  const navigate = useNavigate();

  useEffect(() => {
    const total = products.reduce((acc, product) => acc + product.quantity * product.unitPrice, 0);
    setTotalPrice(total + (total * (isNaN(tax) ? 0 : tax) / 100));
  }, [products, tax]);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    if (field === 'quantity') {
      const quantity = parseInt(value, 10);
      const serialNumbers = new Array(quantity).fill('').map((_, i) => newProducts[index].serialNumbers[i] || '');
      newProducts[index].serialNumbers = serialNumbers;
    }
    setProducts(newProducts);
  };

  const handleSerialNumberChange = (productIndex, serialIndex, value) => {
    const newProducts = [...products];
    newProducts[productIndex].serialNumbers[serialIndex] = value;
    setProducts(newProducts);
  };

  const handleIncreaseQuantity = (index) => {
    const newProducts = [...products];
    newProducts[index].quantity += 1;
    newProducts[index].serialNumbers.push('');
    setProducts(newProducts);
  };

  const handleDecreaseQuantity = (index) => {
    const newProducts = [...products];
    if (newProducts[index].quantity > 1) {
      newProducts[index].quantity -= 1;
      newProducts[index].serialNumbers.pop();
      setProducts(newProducts);
    }
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: '', quantity: 1, serialNumbers: [''], unitPrice: 0 }]);
  };

  const handleDeleteProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invoice = {
      customerName,
      date,
      customerLocation,
      products: products.map(product => ({
        ...product,
        unitPrice: product.unitPrice || 0 // Ensure unitPrice is defined
      })),
      tax,
      totalPrice,
    };
    await addInvoice(invoice);
    setSuccessMessage('Invoice created successfully!');
    setTimeout(() => {
      navigate('/view-invoices');
    }, 2000); // Redirect after 2 seconds
  };

  return (
    <div className="create-invoice-page">
      <button className="back-to-create-invoice" onClick={() => navigate('/create-invoice')}>
        Back to Create Invoice Page
      </button>
      <h1>Create an Invoice</h1>
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-group">
          <label htmlFor="customerName">Customer Name</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="customerLocation">Customer Location</label>
          <input
            type="text"
            id="customerLocation"
            value={customerLocation}
            onChange={(e) => setCustomerLocation(e.target.value)}
            required
          />
        </div>
        {products.map((product, index) => (
          <div key={index} className="product-group">
            <div className="form-group">
              <label htmlFor={`product-${index}`}>Product</label>
              <input
                type="text"
                id={`product-${index}`}
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button type="button" onClick={() => handleDecreaseQuantity(index)}>-</button>
                <span>{product.quantity}</span>
                <button type="button" onClick={() => handleIncreaseQuantity(index)}>+</button>
              </div>
            </div>
            <div className="form-group serial-number-group">
              <label>Serial Number(s)</label>
              {product.serialNumbers.map((serialNumber, serialIndex) => (
                <input
                  key={serialIndex}
                  type="text"
                  value={serialNumber}
                  onChange={(e) => handleSerialNumberChange(index, serialIndex, e.target.value)}
                  required
                />
              ))}
            </div>
            <div className="form-group">
              <label htmlFor={`unitPrice-${index}`}>Unit Price</label>
              <input
                type="number"
                id={`unitPrice-${index}`}
                value={product.unitPrice}
                onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value))}
                required
              />
            </div>
            <button type="button" className="delete-product" onClick={() => handleDeleteProduct(index)}>Delete this product</button>
          </div>
        ))}
        <button type="button" onClick={handleAddProduct}>Add Another Product</button>
        <div className="form-group">
          <label htmlFor="tax">Tax (%)</label>
          <input
            type="number"
            id="tax"
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value))}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="totalPrice">Total Price</label>
          <input
            type="number"
            id="totalPrice"
            value={isNaN(totalPrice) ? '' : totalPrice}
            readOnly
          />
        </div>
        <button type="submit">Create Invoice</button>
      </form>
    </div>
  );
};

export default CreateInvoicePage;