// src/pages/EditInvoicePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import './EditInvoicePage.css';

const EditInvoicePage = () => {
  const { index } = useParams();
  const { invoices, updateInvoice } = useInvoices();
  const invoice = invoices[index];
  const [customerName, setCustomerName] = useState(invoice.customerName);
  const [date, setDate] = useState(invoice.date);
  const [customerLocation, setCustomerLocation] = useState(invoice.customerLocation);
  const [products, setProducts] = useState(invoice.products);
  const [tax, setTax] = useState(invoice.tax);
  const [totalPrice, setTotalPrice] = useState(invoice.totalPrice);
  const navigate = useNavigate();

  useEffect(() => {
    const total = products.reduce((acc, product) => acc + product.quantity * product.unitPrice, 0);
    setTotalPrice(total + (total * tax / 100));
  }, [products, tax]);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleIncreaseQuantity = (index) => {
    const newProducts = [...products];
    newProducts[index].quantity += 1;
    setProducts(newProducts);
  };

  const handleDecreaseQuantity = (index) => {
    const newProducts = [...products];
    if (newProducts[index].quantity > 1) {
      newProducts[index].quantity -= 1;
      setProducts(newProducts);
    }
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: '', quantity: 1, serialNumbers: '', unitPrice: 0 }]);
  };

  const handleDeleteProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedInvoice = {
      customerName,
      date,
      customerLocation,
      products,
      tax,
      totalPrice,
    };
    updateInvoice(index, updatedInvoice);
    navigate('/view-invoices');
  };

  return (
    <div className="edit-invoice-page">
      <h1>Edit Invoice</h1>
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
            <div className="form-group">
              <label htmlFor={`serialNumbers-${index}`}>Serial Number(s)</label>
              <input
                type="text"
                id={`serialNumbers-${index}`}
                value={product.serialNumbers}
                onChange={(e) => handleProductChange(index, 'serialNumbers', e.target.value)}
                required
              />
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
            value={totalPrice}
            readOnly
          />
        </div>
        <button type="submit">Update Invoice</button>
      </form>
    </div>
  );
};

export default EditInvoicePage;