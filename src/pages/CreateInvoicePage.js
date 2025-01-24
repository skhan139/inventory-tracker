import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import './CreateInvoicePage.css';

const CreateInvoicePage = () => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [customerLocation, setCustomerLocation] = useState('');
  const [products, setProducts] = useState([{ name: '', quantity: 1, serialNumbers: '', unitPrice: 0 }]);
  const [tax, setTax] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { addInvoice } = useInvoices();
  const navigate = useNavigate();

  useEffect(() => {
    const total = products.reduce((acc, product) => acc + product.quantity * product.unitPrice, 0);
    setTotalPrice(total + (total * (isNaN(tax) ? 0 : tax) / 100));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invoice = {
      customerName,
      date,
      customerLocation,
      products: products || [], // Ensure products is defined
      tax,
      totalPrice,
    };
    await addInvoice(invoice);
    navigate('/view-invoices');
  };

  return (
    <div className="create-invoice-page">
      <h1>Create an Invoice</h1>
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
            value={isNaN(totalPrice) ? '' : totalPrice}
            readOnly
          />
        </div>
        <button type="submit">Create Invoice</button>
      </form>
      <Link to="/create-invoice">
        <button className="back-button">Back to Create Invoice</button>
      </Link>
    </div>
  );
};

export default CreateInvoicePage;