import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

import { useInvoices } from '../context/InvoicesContext';
import generateStandardPDF from '../utils/generateStandardPDF';
import generateAlleghenyPDF from '../utils/generateAlleghenyPDF';
import './ViewInvoicesPage.css';

const customerFirebaseConfig = {
  apiKey: process.env.REACT_APP_CUSTOMER_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_CUSTOMER_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_CUSTOMER_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_CUSTOMER_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.REACT_APP_CUSTOMER_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_CUSTOMER_FIREBASE_APP_ID,
};

const customerApp = initializeApp(
  customerFirebaseConfig,
  'customerApp'
);

const customerDb = getFirestore(customerApp);

const INVOICES_PER_PAGE = 5;

const ViewInvoicesPage = () => {
  const {
    invoices = [],
    deleteInvoice,
    alleghenyCountyInvoices = [],
  } = useInvoices();

  const navigate = useNavigate();
  const db = getFirestore();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewingType, setViewingType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fulfilledOrders, setFulfilledOrders] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const [showPostForm, setShowPostForm] = useState(false);
  const [invoiceToPost, setInvoiceToPost] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  /*
   * Fetch fulfillment values for standard invoices.
   *
   * If Allegheny invoices are stored in a different Firestore collection,
   * add a second request here using that collection's actual name.
   */
  useEffect(() => {
    let isActive = true;

    const fetchFulfillmentStatuses = async () => {
      try {
        const statusEntries = await Promise.all(
          invoices.map(async (invoice) => {
            const invoiceRef = doc(db, 'invoices', invoice.id);
            const invoiceSnapshot = await getDoc(invoiceRef);

            return [
              invoice.id,
              invoiceSnapshot.exists()
                ? Boolean(invoiceSnapshot.data().fulfilled)
                : false,
            ];
          })
        );

        if (isActive) {
          setFulfilledOrders(Object.fromEntries(statusEntries));
        }
      } catch (error) {
        console.error(
          'Unable to fetch invoice fulfillment statuses:',
          error
        );
      }
    };

    if (invoices.length > 0) {
      fetchFulfillmentStatuses();
    } else {
      setFulfilledOrders({});
    }

    return () => {
      isActive = false;
    };
  }, [invoices, db]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewingType, invoices, alleghenyCountyInvoices]);

  const sortedInvoices = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return invoices
      .filter((invoice) =>
        (invoice.customerName || '')
          .toLowerCase()
          .includes(normalizedSearchTerm)
      )
      .sort(
        (firstInvoice, secondInvoice) =>
          new Date(secondInvoice.date).getTime() -
          new Date(firstInvoice.date).getTime()
      );
  }, [invoices, searchTerm]);

  const sortedAlleghenyCountyInvoices = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return alleghenyCountyInvoices
      .filter((invoice) =>
        (invoice.customerName || '')
          .toLowerCase()
          .includes(normalizedSearchTerm)
      )
      .sort(
        (firstInvoice, secondInvoice) =>
          new Date(secondInvoice.date).getTime() -
          new Date(firstInvoice.date).getTime()
      );
  }, [alleghenyCountyInvoices, searchTerm]);

  const selectedInvoices =
    viewingType === 'standard'
      ? sortedInvoices
      : sortedAlleghenyCountyInvoices;

  const totalPages = Math.ceil(
    selectedInvoices.length / INVOICES_PER_PAGE
  );

  const indexOfFirstInvoice =
    (currentPage - 1) * INVOICES_PER_PAGE;

  const indexOfLastInvoice =
    indexOfFirstInvoice + INVOICES_PER_PAGE;

  const currentInvoices = selectedInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  const handleSelectInvoiceType = (invoiceType) => {
    setViewingType(invoiceType);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleReturnToTypeSelection = () => {
    setViewingType(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleEdit = (invoiceId) => {
    navigate(`/edit-invoice/${invoiceId}`);
  };

  const handleDelete = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) {
      return;
    }

    try {
      await deleteInvoice(invoiceToDelete);
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    } catch (error) {
      console.error('Unable to delete invoice:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  const handleDownloadPDF = (invoice) => {
    if (viewingType === 'standard') {
      generateStandardPDF(invoice);
      return;
    }

    if (viewingType === 'allegheny') {
      generateAlleghenyPDF(invoice);
    }
  };

  const handleCheckboxChange = async (invoiceId) => {
    const previousStatus = Boolean(fulfilledOrders[invoiceId]);
    const newStatus = !previousStatus;

    setFulfilledOrders((currentStatuses) => ({
      ...currentStatuses,
      [invoiceId]: newStatus,
    }));

    try {
      /*
       * This preserves the existing "invoices" collection behavior.
       * Change this collection name for Allegheny invoices if they are
       * stored separately.
       */
      const invoiceRef = doc(db, 'invoices', invoiceId);
      await updateDoc(invoiceRef, {
        fulfilled: newStatus,
      });
    } catch (error) {
      setFulfilledOrders((currentStatuses) => ({
        ...currentStatuses,
        [invoiceId]: previousStatus,
      }));

      console.error('Unable to update fulfillment status:', error);
    }
  };

  const handlePostToCustomerWebsite = (invoice) => {
    setInvoiceToPost(invoice);
    setCustomerEmail(invoice.customerEmail || '');
    setShowPostForm(true);
  };

  const closePostForm = () => {
    if (isPosting) {
      return;
    }

    setShowPostForm(false);
    setInvoiceToPost(null);
    setCustomerEmail('');
  };

  const handleSubmitPostForm = async (event) => {
    event.preventDefault();

    const normalizedEmail = customerEmail.trim();

    if (!normalizedEmail || !invoiceToPost) {
      return;
    }

    setIsPosting(true);

    try {
      const customerInvoicesRef = collection(
        customerDb,
        'customerInvoices'
      );

      await addDoc(customerInvoicesRef, {
        customerEmail: normalizedEmail,
        customerName: invoiceToPost.customerName,
        date: invoiceToPost.date,
        customerLocation: invoiceToPost.customerLocation,
        products: invoiceToPost.products || [],
        tax: invoiceToPost.tax || 0,
        discountType: invoiceToPost.discountType || 'percent',
        discountValue: invoiceToPost.discountValue || 0,
        totalPrice: invoiceToPost.totalPrice || 0,
        fulfilled: invoiceToPost.fulfilled || false,
      });

      window.alert(
        'Invoice successfully posted to the customer website.'
      );

      setShowPostForm(false);
      setInvoiceToPost(null);
      setCustomerEmail('');
    } catch (error) {
      console.error(
        'Error posting invoice to customer website:',
        error
      );

      window.alert(
        'The invoice could not be posted. Please try again.'
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const hasNoInvoices =
    viewingType !== null && selectedInvoices.length === 0;

  return (
    <main className="view-invoices-page">
      <header className="invoice-button-wrapper">
        <h1 className="invoice">View Previous Invoices</h1>
      </header>

      {viewingType === null ? (
        <section
          className="button-container"
          aria-label="Select an invoice type"
        >
          <button
            type="button"
            className="invoice-button"
            onClick={() => handleSelectInvoiceType('standard')}
          >
            View Standard Invoices
          </button>

          <button
            type="button"
            className="invoice-button"
            onClick={() => handleSelectInvoiceType('allegheny')}
          >
            View Allegheny County Invoices
          </button>
        </section>
      ) : (
        <>
          <button
            type="button"
            className="back-button"
            onClick={handleReturnToTypeSelection}
          >
            Back to Select Invoice Type
          </button>

          <div className="create-button-container">
            <button
              type="button"
              className="create-button"
              onClick={() => navigate('/create-invoice')}
            >
              Create Invoice
            </button>
          </div>

          <input
            type="search"
            className="search-bar"
            aria-label="Search invoices by customer name"
            placeholder="Search by customer name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {hasNoInvoices && (
            <p role="status">
              {searchTerm.trim()
                ? `No invoices found for “${searchTerm.trim()}”.`
                : viewingType === 'standard'
                  ? 'No standard invoices are available.'
                  : 'No Allegheny County invoices are available.'}
            </p>
          )}

          {!hasNoInvoices && (
            <ul aria-label="Invoices">
              {currentInvoices.map((invoice, index) => {
                const displayedInvoiceNumber =
                  indexOfFirstInvoice + index + 1;

                return (
                  <li
                    key={invoice.id}
                    className="invoice-item"
                  >
                    <button
                      type="button"
                      className="delete-invoice"
                      aria-label={`Delete invoice for ${
                        invoice.customerName || 'this customer'
                      }`}
                      title="Delete invoice"
                      onClick={() => handleDelete(invoice.id)}
                    >
                      ×
                    </button>

                    <div className="invoice-header">
                      <h2 className="invoice">
                        Invoice {displayedInvoiceNumber}
                      </h2>
                    </div>

                    <div className="invoice-details">
                      <p>
                        Customer Name:{' '}
                        {invoice.customerName || 'Not provided'}
                      </p>

                      <p>
                        Date: {invoice.date || 'Not provided'}
                      </p>

                      <p>
                        Customer Location:{' '}
                        {invoice.customerLocation || 'Not provided'}
                      </p>
                    </div>

                    <div className="invoice-products">
                      <h3>Products</h3>

                      {invoice.products?.length > 0 ? (
                        <ul>
                          {invoice.products.map(
                            (product, productIndex) => (
                              <li
                                key={`${invoice.id}-product-${productIndex}`}
                              >
                                <p>
                                  Product:{' '}
                                  {product.name || 'Not provided'}
                                </p>

                                <p>
                                  Quantity: {product.quantity ?? 0}
                                </p>

                                <p>
                                  Serial Numbers:{' '}
                                  {Array.isArray(
                                    product.serialNumbers
                                  ) &&
                                  product.serialNumbers.length > 0
                                    ? product.serialNumbers.join(', ')
                                    : 'N/A'}
                                </p>

                                <p>
                                  Unit Price:{' '}
                                  {typeof product.unitPrice ===
                                  'number'
                                    ? `$${product.unitPrice.toFixed(
                                        2
                                      )}`
                                    : 'N/A'}
                                </p>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>No products recorded.</p>
                      )}
                    </div>

                    <div
                      className="invoice-actions"
                      aria-label={`Actions for invoice ${displayedInvoiceNumber}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleEdit(invoice.id)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadPDF(invoice)
                        }
                      >
                        Download PDF
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handlePostToCustomerWebsite(invoice)
                        }
                      >
                        Post to Customer Website
                      </button>
                    </div>

                    <p>Tax: {invoice.tax ?? 0}%</p>

                    <p>
                      Discount:{' '}
                      {invoice.discountType === 'percent'
                        ? `${invoice.discountValue ?? 0}%`
                        : typeof invoice.discountValue ===
                            'number'
                          ? `$${invoice.discountValue.toFixed(2)}`
                          : '$0.00'}
                    </p>

                    <p>
                      Total Price:{' '}
                      {typeof invoice.totalPrice === 'number'
                        ? `$${invoice.totalPrice.toFixed(2)}`
                        : 'N/A'}
                    </p>

                    <div className="order-fulfilled">
                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(
                            fulfilledOrders[invoice.id]
                          )}
                          onChange={() =>
                            handleCheckboxChange(invoice.id)
                          }
                        />
                        Order fulfilled
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {totalPages > 1 && (
            <nav
              className="pagination"
              aria-label="Invoice pages"
            >
              {Array.from(
                { length: totalPages },
                (_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      className={`page-button ${
                        currentPage === pageNumber
                          ? 'active'
                          : ''
                      }`}
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={
                        currentPage === pageNumber
                          ? 'page'
                          : undefined
                      }
                      onClick={() =>
                        handlePageChange(pageNumber)
                      }
                    >
                      {pageNumber}
                    </button>
                  );
                }
              )}
            </nav>
          )}
        </>
      )}

      {showPostForm && (
        <div
          className="modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePostForm();
            }
          }}
        >
          <form
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-invoice-heading"
            onSubmit={handleSubmitPostForm}
          >
            <h2 id="post-invoice-heading">
              Post Invoice to Customer Website
            </h2>

            <p>
              Customer Name:{' '}
              {invoiceToPost?.customerName || 'Not provided'}
            </p>

            <p>
              Date: {invoiceToPost?.date || 'Not provided'}
            </p>

            <p>
              Total Price:{' '}
              {typeof invoiceToPost?.totalPrice === 'number'
                ? `$${invoiceToPost.totalPrice.toFixed(2)}`
                : 'N/A'}
            </p>

            <label htmlFor="customer-email">
              Customer Email

              <input
                id="customer-email"
                type="email"
                value={customerEmail}
                onChange={(event) =>
                  setCustomerEmail(event.target.value)
                }
                autoComplete="email"
                placeholder="customer@example.com"
                disabled={isPosting}
                required
                autoFocus
              />
            </label>

            <button type="submit" disabled={isPosting}>
              {isPosting ? 'Posting…' : 'Post Invoice'}
            </button>

            <button
              type="button"
              onClick={closePostForm}
              disabled={isPosting}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cancelDelete();
            }
          }}
        >
          <div
            className="modal-content"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-invoice-heading"
            aria-describedby="delete-invoice-description"
          >
            <h2 id="delete-invoice-heading">
              Delete invoice?
            </h2>

            <p id="delete-invoice-description">
              This action cannot be undone. Are you sure you
              want to permanently delete this invoice?
            </p>

            <button
              type="button"
              onClick={confirmDelete}
              autoFocus
            >
              Delete Invoice
            </button>

            <button
              type="button"
              onClick={cancelDelete}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ViewInvoicesPage;