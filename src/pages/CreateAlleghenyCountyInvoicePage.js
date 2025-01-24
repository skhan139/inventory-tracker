import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; // Ensure this is the correct path to your firebase config
import { collection, addDoc } from 'firebase/firestore';
import './CreateAlleghenyCountyInvoicePage.css';

const CreateAlleghenyCountyInvoicePage = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    date: new Date().toISOString().substr(0, 10),
    customerLocation: '',
    products: [{
      id: Date.now(),
      name: '',
      quantity: 1,
      stickerNumber: '',
      serialNumber: '',
      grossProfit: 0,
      productPrice: 0,
      taxableProfit: 0
    }],
    salesTax: 0,
    subTotal: 0,
    total: 0,
  });

  const [totals, setTotals] = useState({ grossProfit: 0, productPrice: 0, taxableProfit: 0 });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const subTotal = formData.products.reduce((acc, product) => acc + product.quantity * product.productPrice, 0);
    const total = subTotal + (subTotal * (isNaN(formData.salesTax) ? 0 : formData.salesTax) / 100);
    setFormData(prevData => ({ ...prevData, subTotal, total }));

    const grossProfitTotal = formData.products.reduce((acc, product) => acc + product.grossProfit * product.quantity, 0);
    const productPriceTotal = formData.products.reduce((acc, product) => acc + product.productPrice * product.quantity, 0);
    const taxableProfitTotal = formData.products.reduce((acc, product) => acc + product.taxableProfit * product.quantity, 0);
    setTotals({ grossProfit: grossProfitTotal, productPrice: productPriceTotal, taxableProfit: taxableProfitTotal });
  }, [formData.products, formData.salesTax]);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    if (field === 'quantity') {
      const existingProduct = newProducts[index];
      const additionalQuantity = parseInt(value) - 1;
      if (additionalQuantity >= 0) {
        const additionalProducts = Array.from({ length: additionalQuantity }, (_, i) => ({
          ...existingProduct,
          id: Date.now() + i,
          quantity: 1,
          stickerNumber: newProducts[index + i + 1]?.stickerNumber || '',
          serialNumber: newProducts[index + i + 1]?.serialNumber || ''
        }));
        newProducts.splice(index + 1, newProducts.length - index - 1, ...additionalProducts);
      }
    }
    setFormData(prevData => ({ ...prevData, products: newProducts }));
  };

  const handleAddProduct = () => {
    setFormData(prevData => ({
      ...prevData,
      products: [...prevData.products, {
        id: Date.now(),
        name: '',
        quantity: 1,
        stickerNumber: '',
        serialNumber: '',
        grossProfit: 0,
        productPrice: 0,
        taxableProfit: 0
      }]
    }));
  };

  const handleDeleteProduct = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData(prevData => ({ ...prevData, products: newProducts }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add the invoice to the alleghenyCountyInvoices collection
      await addDoc(collection(db, 'alleghenyCountyInvoices'), formData);
      console.log('Invoice added to Firestore:', formData);

      // Show success message
      setShowSuccessMessage(true);

      // Clear form fields
      setFormData({
        customerName: '',
        date: new Date().toISOString().substr(0, 10),
        customerLocation: '',
        products: [{
          id: Date.now(),
          name: '',
          quantity: 1,
          stickerNumber: '',
          serialNumber: '',
          grossProfit: 0,
          productPrice: 0,
          taxableProfit: 0
        }],
        salesTax: 0,
        subTotal: 0,
        total: 0,
      });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div className="create-allegheny-county-invoice-page">
      <h1>Create Allegheny County Invoice</h1>
      <form onSubmit={handleSubmit} className="invoice-form">
        {showSuccessMessage && <div className="success-message">Invoice created successfully</div>}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="customerName">Customer Name</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="customerLocation">Customer Location</label>
            <input
              type="text"
              id="customerLocation"
              name="customerLocation"
              value={formData.customerLocation}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        {formData.products.map((product, index) => (
          <div key={product.id} className="form-row product-group">
            <div className="form-group">
              <label htmlFor={`product-${index}`}>Product</label>
              <input
                type="text"
                id={`product-${index}`}
                name="name"
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                id={`quantity-${index}`}
                name="quantity"
                value={product.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`stickerNumber-${index}`}>Sticker Number</label>
              <input
                type="text"
                id={`stickerNumber-${index}`}
                name="stickerNumber"
                value={product.stickerNumber}
                onChange={(e) => handleProductChange(index, 'stickerNumber', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`serialNumber-${index}`}>Serial Number</label>
              <input
                type="text"
                id={`serialNumber-${index}`}
                name="serialNumber"
                value={product.serialNumber}
                onChange={(e) => handleProductChange(index, 'serialNumber', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`grossProfit-${index}`}>Gross Profit</label>
              <input
                type="number"
                id={`grossProfit-${index}`}
                name="grossProfit"
                value={product.grossProfit}
                onChange={(e) => handleProductChange(index, 'grossProfit', parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`productPrice-${index}`}>Product Price</label>
              <input
                type="number"
                id={`productPrice-${index}`}
                name="productPrice"
                value={product.productPrice}
                onChange={(e) => handleProductChange(index, 'productPrice', parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`taxableProfit-${index}`}>Taxable Profit</label>
              <input
                type="number"
                id={`taxableProfit-${index}`}
                name="taxableProfit"
                value={product.taxableProfit}
                onChange={(e) => handleProductChange(index, 'taxableProfit', parseFloat(e.target.value))}
                required
              />
            </div>
            <button type="button" className="delete-product" onClick={() => handleDeleteProduct(index)}>Delete</button>
          </div>
        ))}
        <div className="form-row totals-row">
          <div className="form-group">
            <label>Total Gross Profit</label>
            <input type="number" value={totals.grossProfit} readOnly />
          </div>
          <div className="form-group">
            <label>Total Product Price</label>
            <input type="number" value={totals.productPrice} readOnly />
          </div>
          <div className="form-group">
            <label>Total Taxable Profit</label>
            <input type="number" value={totals.taxableProfit} readOnly />
          </div>
        </div>
        <button type="button" onClick={handleAddProduct}>Add Another Product</button>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salesTax">Sales Tax (%)</label>
            <input
              type="number"
              id="salesTax"
              name="salesTax"
              value={formData.salesTax}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="subTotal">Sub Total</label>
            <input
              type="number"
              id="subTotal"
              name="subTotal"
              value={isNaN(formData.subTotal) ? '' : formData.subTotal}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="total">Total + Sales Tax</label>
            <input
              type="number"
              id="total"
              name="total"
              value={isNaN(formData.total) ? '' : formData.total}
              readOnly
            />
          </div>
        </div>
        <button type="submit">Create Invoice</button>
      </form>
      <Link to="/create-invoice">
        <button className="back-button">Back to Create Invoice</button>
      </Link>
    </div>
  );
};

export default CreateAlleghenyCountyInvoicePage;