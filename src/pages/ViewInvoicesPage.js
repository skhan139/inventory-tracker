// src/pages/ViewInvoicesPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import './ViewInvoicesPage.css';

const ViewInvoicesPage = () => {
  const { invoices, deleteInvoice } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const navigate = useNavigate();

  const filteredInvoices = invoices ? invoices.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleEdit = (index) => {
    navigate(`/edit-invoice/${index}`);
  };

  const handleDelete = (index) => {
    setInvoiceToDelete(index);
    setShowModal(true);
  };

  const confirmDelete = () => {
    deleteInvoice(invoiceToDelete);
    setShowModal(false);
    setInvoiceToDelete(null);
  };

  const cancelDelete = () => {
    setShowModal(false);
    setInvoiceToDelete(null);
  };

  return (
    <div className="view-invoices-page">
      <h1>View Previous Invoices</h1>
      <Link to="/" className="back-to-homepage">Back to Homepage</Link>
      <input
        type="text"
        placeholder="Search by customer name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {filteredInvoices.length === 0 ? (
        <p>No invoices available.</p>
      ) : (
        <ul>
          {filteredInvoices.map((invoice, index) => (
            <li key={index} className="invoice-item">
              <button className="delete-invoice" onClick={() => handleDelete(index)}>X</button>
              <h2>Invoice {index + 1}</h2>
              <p>Customer Name: {invoice.customerName}</p>
              <p>Date: {invoice.date}</p>
              <p>Customer Location: {invoice.customerLocation}</p>
              <h3>Products:</h3>
              <ul>
                {invoice.products && invoice.products.map((product, idx) => (
                  <li key={idx}>
                    <p>Product: {product.name}</p>
                    <p>Quantity: {product.quantity}</p>
                    <p>Serial Numbers: {product.serialNumbers}</p>
                    <p>Unit Price: ${product.unitPrice !== undefined ? product.unitPrice.toFixed(2) : 'N/A'}</p>
                  </li>
                ))}
              </ul>
              <p>Tax: {invoice.tax}%</p>
              <p>Total Price: ${invoice.totalPrice.toFixed(2)}</p>
              <button onClick={() => handleEdit(index)}>Edit</button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this invoice?</p>
            <button onClick={confirmDelete}>Yes</button>
            <button onClick={cancelDelete}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewInvoicesPage;