import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import './CreateInvoicePage.css';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CreateInvoicePage = () => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [customerLocation, setCustomerLocation] = useState('');
  const [products, setProducts] = useState([{ name: '', quantity: 1, serialNumbers: [''], unitPrice: 0 }]);
  const [tax, setTax] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'dollar'
  const [discountValue, setDiscountValue] = useState(0);
  const { addInvoice } = useInvoices();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => doc.data());
      setAvailableProducts(productsList);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const total = products.reduce((acc, product) => acc + product.quantity * product.unitPrice, 0);
    const totalWithTax = total + (total * (isNaN(tax) ? 0 : tax) / 100);
    let finalTotal = totalWithTax;

    if (discountType === 'percent') {
      finalTotal -= (totalWithTax * (isNaN(discountValue) ? 0 : discountValue) / 100);
    } else if (discountType === 'dollar') {
      finalTotal -= (isNaN(discountValue) ? 0 : discountValue);
    }

    setTotalPrice(finalTotal);
  }, [products, tax, discountType, discountValue]);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    if (field === 'name') {
      const selectedProduct = availableProducts.find(product => product.name === value);
      if (selectedProduct) {
        newProducts[index].unitPrice = selectedProduct.unitPrice;
      } else {
        newProducts[index].unitPrice = 0; // Reset unit price if manual entry
      }
    }
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
              <select
                id={`product-${index}`}
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
              >
                <option value="">Select a product</option>
                {availableProducts.map((availableProduct, i) => (
                  <option key={i} value={availableProduct.name}>{availableProduct.name}</option>
                ))}
              </select>
              <input
                type="text"
                id={`product-${index}-manual`}
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                placeholder="Or enter manually"
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
          <label htmlFor="discountType">Discount Type</label>
          <select
            id="discountType"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
          >
            <option value="percent">Percent</option>
            <option value="dollar">Dollar</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="discountValue">Discount Value</label>
          <input
            type="number"
            id="discountValue"
            value={discountValue}
            onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
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