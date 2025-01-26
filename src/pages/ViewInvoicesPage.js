// src/pages/ViewInvoicesPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import generateStandardPDF from '../utils/generateStandardPDF';
import generateAlleghenyPDF from '../utils/generateAlleghenyPDF';
import './ViewInvoicesPage.css';

const ViewInvoicesPage = () => {
  const { invoices, deleteInvoice, alleghenyCountyInvoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [viewingType, setViewingType] = useState(null); // null, 'standard', 'allegheny'

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetched Allegheny County Invoices in Component:", alleghenyCountyInvoices); // Debug log
  }, [alleghenyCountyInvoices]);

  const handleEdit = (id) => {
    navigate(`/edit-invoice/${id}`);
  };

  const handleDelete = (id) => {
    setInvoiceToDelete(id);
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

  const handleDownloadPDF = (invoice) => {
    if (viewingType === 'standard') {
      generateStandardPDF(invoice);
    } else if (viewingType === 'allegheny') {
      generateAlleghenyPDF(invoice);
    }
  };

  const filteredInvoices = invoices?.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAlleghenyCountyInvoices = alleghenyCountyInvoices?.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="view-invoices-page">
      <h1 className='invoice'>View Previous Invoices</h1>
      {viewingType === null ? (
        <div className="button-container">
          <button onClick={() => setViewingType('standard')} className="invoice-button">View Standard Invoices</button>
          <button onClick={() => setViewingType('allegheny')} className="invoice-button">View Allegheny County Invoices</button>
        </div>
      ) : (
        <>
          <Link to="/create-invoice" className="back-button">Back to Select Invoice Type</Link>
          <div className="create-button-container">
            <Link to="/create-invoice" className="create-button">Create Invoice</Link>
          </div>
          <input
            type="text"
            placeholder="Search by customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          {viewingType === 'standard' && filteredInvoices.length === 0 && (
            <p>No standard invoices available.</p>
          )}
          {viewingType === 'allegheny' && filteredAlleghenyCountyInvoices.length === 0 && (
            <p>No Allegheny County invoices available.</p>
          )}
          <ul>
            {(viewingType === 'standard' ? filteredInvoices : filteredAlleghenyCountyInvoices).map((invoice, index) => (
              <li key={invoice.id} className="invoice-item">
                <button className="delete-invoice" onClick={() => handleDelete(invoice.id)}>X</button>
                <h2 className='invoice'>Invoice {index + 1}</h2>
                <p>Customer Name: {invoice.customerName}</p>
                <p>Date: {invoice.date}</p>
                <p>Customer Location: {invoice.customerLocation}</p>
                <h3>Products:</h3>
                <ul>
                  {invoice.products && invoice.products.map((product, idx) => (
                    <li key={idx}>
                      <p>Product: {product.name}</p>
                      <p>Quantity: {product.quantity}</p>
                      <p>Serial Numbers: {Array.isArray(product.serialNumbers) ? product.serialNumbers.join(', ') : 'N/A'}</p>
                      <p>Unit Price: ${product.unitPrice !== undefined ? product.unitPrice.toFixed(2) : 'N/A'}</p>
                    </li>
                  ))}
                </ul>
                <p>Tax: {invoice.tax}%</p>
                <p>Total Price: ${invoice.totalPrice !== undefined ? invoice.totalPrice.toFixed(2) : 'N/A'}</p>
                <div className="invoice-actions">
                  <button onClick={() => handleEdit(invoice.id)}>Edit</button>
                  <button onClick={() => handleDownloadPDF(invoice)}>Download PDF</button>
                </div>
              </li>
            ))}
          </ul>
        </>
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