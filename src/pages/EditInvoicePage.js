// src/pages/EditInvoicePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import './EditInvoicePage.css';

const EditInvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Initialize state hooks
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [products, setProducts] = useState([]);
  const [tax, setTax] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.error('No invoice ID provided');
      navigate('/view-invoices');
      return;
    }

    const fetchInvoice = async () => {
      try {
        const db = getFirestore();
        const invoiceRef = doc(db, 'invoices', id);
        const invoiceSnap = await getDoc(invoiceRef);

        if (invoiceSnap.exists()) {
          const invoice = invoiceSnap.data();
          setCustomerName(invoice.customerName);
          setDate(invoice.date);
          setCustomerLocation(invoice.customerLocation);
          setProducts(invoice.products.map(product => ({
            ...product,
            serialNumbers: Array.isArray(product.serialNumbers) ? product.serialNumbers : [product.serialNumbers]
          })));
          setTax(invoice.tax);
          setTotalPrice(invoice.totalPrice);
        } else {
          console.log('No such document!');
          navigate('/view-invoices');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        navigate('/view-invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, navigate]);

  useEffect(() => {
    const total = products.reduce((acc, product) => acc + product.quantity * product.unitPrice, 0);
    setTotalPrice(total + (total * tax / 100));
  }, [products, tax]);

  const handleProductChange = (productIndex, field, value) => {
    const newProducts = [...products];
    newProducts[productIndex][field] = value;
    setProducts(newProducts);
  };

  const handleSerialNumberChange = (productIndex, serialIndex, value) => {
    const newProducts = [...products];
    newProducts[productIndex].serialNumbers[serialIndex] = value;
    setProducts(newProducts);
  };

  const handleAddSerialNumber = (productIndex) => {
    const newProducts = [...products];
    newProducts[productIndex].serialNumbers.push('');
    setProducts(newProducts);
  };

  const handleDeleteSerialNumber = (productIndex, serialIndex) => {
    const newProducts = [...products];
    newProducts[productIndex].serialNumbers.splice(serialIndex, 1);
    setProducts(newProducts);
  };

  const handleIncreaseQuantity = (productIndex) => {
    const newProducts = [...products];
    newProducts[productIndex].quantity += 1;
    setProducts(newProducts);
  };

  const handleDecreaseQuantity = (productIndex) => {
    const newProducts = [...products];
    if (newProducts[productIndex].quantity > 1) {
      newProducts[productIndex].quantity -= 1;
      setProducts(newProducts);
    }
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: '', quantity: 1, serialNumbers: [''], unitPrice: 0 }]);
  };

  const handleDeleteProduct = (productIndex) => {
    const newProducts = products.filter((_, i) => i !== productIndex);
    setProducts(newProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedInvoice = {
      customerName,
      date,
      customerLocation,
      products,
      tax,
      totalPrice,
    };
    const db = getFirestore();
    const invoiceRef = doc(db, 'invoices', id);
    await updateDoc(invoiceRef, updatedInvoice);
    navigate('/view-invoices');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
        {products.map((product, productIndex) => (
          <div key={productIndex} className="product-group">
            <div className="form-group">
              <label htmlFor={`product-${productIndex}`}>Product</label>
              <input
                type="text"
                id={`product-${productIndex}`}
                value={product.name}
                onChange={(e) => handleProductChange(productIndex, 'name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button type="button" onClick={() => handleDecreaseQuantity(productIndex)}>-</button>
                <span>{product.quantity}</span>
                <button type="button" onClick={() => handleIncreaseQuantity(productIndex)}>+</button>
              </div>
            </div>
            <div className="form-group">
              <label>Serial Numbers</label>
              {product.serialNumbers.map((serialNumber, serialIndex) => (
                <div key={serialIndex} className="serial-number-group">
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => handleSerialNumberChange(productIndex, serialIndex, e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => handleDeleteSerialNumber(productIndex, serialIndex)}>Delete Serial Number</button>
                </div>
              ))}
              <button type="button" onClick={() => handleAddSerialNumber(productIndex)}>Add Serial Number</button>
            </div>
            <div className="form-group">
              <label htmlFor={`unitPrice-${productIndex}`}>Unit Price</label>
              <input
                type="number"
                id={`unitPrice-${productIndex}`}
                value={product.unitPrice}
                onChange={(e) => handleProductChange(productIndex, 'unitPrice', parseFloat(e.target.value))}
                required
              />
            </div>
            <button type="button" className="delete-product" onClick={() => handleDeleteProduct(productIndex)}>Delete this product</button>
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
        <button type="submit">Save Invoice</button>
      </form>
    </div>
  );
};

export default EditInvoicePage;