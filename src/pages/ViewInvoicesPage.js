import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import generateStandardPDF from '../utils/generateStandardPDF';
import generateAlleghenyPDF from '../utils/generateAlleghenyPDF';
import './ViewInvoicesPage.css';

const ViewInvoicesPage = () => {
  const { invoices, deleteInvoice, alleghenyCountyInvoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [viewingType, setViewingType] = useState(null); // null, 'standard', 'allegheny'
  const [fulfilledOrders, setFulfilledOrders] = useState({}); // State to track fulfilled orders
  const [currentPage, setCurrentPage] = useState(1); // State to track the current page
  const invoicesPerPage = 5; // Number of invoices per page

  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    console.log("Fetched Allegheny County Invoices in Component:", alleghenyCountyInvoices); // Debug log
  }, [alleghenyCountyInvoices]);

  useEffect(() => {
    const fetchFulfillmentStatus = async () => {
      const newFulfilledOrders = {};
      for (const invoice of invoices) {
        const invoiceRef = doc(db, 'invoices', invoice.id);
        const invoiceSnap = await getDoc(invoiceRef);
        if (invoiceSnap.exists()) {
          newFulfilledOrders[invoice.id] = invoiceSnap.data().fulfilled || false;
        }
      }
      setFulfilledOrders(newFulfilledOrders);
    };

    if (invoices.length > 0) {
      fetchFulfillmentStatus();
    }
  }, [invoices, db]);

  useEffect(() => {
    // Re-fetch or update the invoices when the invoices context changes
    setCurrentPage(1); // Reset to the first page when invoices change
  }, [invoices]);

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

  const handleCheckboxChange = async (id) => {
    const newFulfilledStatus = !fulfilledOrders[id];
    setFulfilledOrders((prev) => ({
      ...prev,
      [id]: newFulfilledStatus,
    }));

    const invoiceRef = doc(db, 'invoices', id);
    await updateDoc(invoiceRef, { fulfilled: newFulfilledStatus });
  };

  const filteredInvoices = invoices?.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAlleghenyCountyInvoices = alleghenyCountyInvoices?.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Sort invoices by date in descending order
  const sortedInvoices = filteredInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
  const sortedAlleghenyCountyInvoices = filteredAlleghenyCountyInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination logic
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = viewingType === 'standard' ? sortedInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice) : sortedAlleghenyCountyInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

  const totalPages = Math.ceil((viewingType === 'standard' ? sortedInvoices.length : sortedAlleghenyCountyInvoices.length) / invoicesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="view-invoices-page">
      <button className="invoice-button-wrapper">
        <h1 className='invoice'>View Previous Invoices</h1>
      </button>
      {viewingType === null ? (
        <div className="button-container">
          <button onClick={() => setViewingType('standard')} className="invoice-button">View Standard Invoices</button>
          <button onClick={() => setViewingType('allegheny')} className="invoice-button">View Allegheny County Invoices</button>
        </div>
      ) : (
        <>
          <button onClick={() => setViewingType(null)} className="back-button">Back to Select Invoice Type</button>
          <div className="create-button-container">
            <button onClick={() => navigate('/create-invoice')} className="create-button">Create Invoice</button>
          </div>
          <input
            type="text"
            placeholder="Search by customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          {viewingType === 'standard' && sortedInvoices.length === 0 && (
            <p>No standard invoices available.</p>
          )}
          {viewingType === 'allegheny' && sortedAlleghenyCountyInvoices.length === 0 && (
            <p>No Allegheny County invoices available.</p>
          )}
          <ul>
            {currentInvoices.map((invoice, index) => (
              <li key={invoice.id} className="invoice-item">
                <button className="delete-invoice" onClick={() => handleDelete(invoice.id)}>X</button>
                <div className="invoice-header">
                  <h2 className='invoice'>Invoice {index + 1}</h2>
                </div>
                <div className="invoice-details">
                  <p>Customer Name: {invoice.customerName}</p>
                  <p>Date: {invoice.date}</p>
                  <p>Customer Location: {invoice.customerLocation}</p>
                </div>
                <div className="invoice-products">
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
                </div>
                <div className="invoice-actions">
                  <button onClick={() => handleEdit(invoice.id)}>Edit</button>
                  <button onClick={() => handleDownloadPDF(invoice)}>Download PDF</button>
                </div>
                <p>Tax: {invoice.tax}%</p>
                <p>Discount: {invoice.discountType === 'percent' ? `${invoice.discountValue}%` : `$${invoice.discountValue !== undefined ? invoice.discountValue.toFixed(2) : 'N/A'}`}</p>
                <p>Total Price: ${invoice.totalPrice !== undefined ? invoice.totalPrice.toFixed(2) : 'N/A'}</p>
                <div className="order-fulfilled">
                  <label>
                    <input
                      type="checkbox"
                      checked={fulfilledOrders[invoice.id] || false}
                      onChange={() => handleCheckboxChange(invoice.id)}
                    />
                    Order Fulfilled?
                  </label>
                </div>
              </li>
            ))}
          </ul>
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
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