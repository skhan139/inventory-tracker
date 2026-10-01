import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import generateStandardPDF from '../utils/generateStandardPDF';
import generateAlleghenyPDF from '../utils/generateAlleghenyPDF';
import './CustomersPage.css';

const PHONE_NUMBERS_STORAGE_KEY = 'inventory-tracker-customer-phone-numbers';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const readStoredPhoneNumbers = () => {
  try {
    const storedPhoneNumbers = window.localStorage.getItem(PHONE_NUMBERS_STORAGE_KEY);
    return storedPhoneNumbers ? JSON.parse(storedPhoneNumbers) : {};
  } catch {
    return {};
  }
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : 'N/A';
};

const CustomersPage = () => {
  const {
    invoices = [],
    alleghenyCountyInvoices = [],
    fetchInvoices,
  } = useInvoices();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState(readStoredPhoneNumbers);
  const [editingPhoneNumber, setEditingPhoneNumber] = useState('');
  const [isEditingPhoneNumber, setIsEditingPhoneNumber] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadInvoices = async () => {
      try {
        setLoadError('');
        await fetchInvoices();
      } catch (error) {
        console.error('Unable to load invoices:', error);
        if (isActive) {
          setLoadError('Invoices could not be loaded. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadInvoices();

    return () => {
      isActive = false;
    };
  }, [fetchInvoices]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PHONE_NUMBERS_STORAGE_KEY,
        JSON.stringify(phoneNumbers),
      );
    } catch (error) {
      console.error('Unable to save customer phone numbers:', error);
    }
  }, [phoneNumbers]);

  const alleghenyInvoiceIds = useMemo(
    () => new Set(alleghenyCountyInvoices.map(({ id }) => id)),
    [alleghenyCountyInvoices],
  );

  const allInvoices = useMemo(
    () => [
      ...invoices.map((invoice) => ({ ...invoice, invoiceType: 'standard' })),
      ...alleghenyCountyInvoices.map((invoice) => ({
        ...invoice,
        invoiceType: 'allegheny',
      })),
    ],
    [invoices, alleghenyCountyInvoices],
  );

  const filteredCustomers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
    const customerNames = allInvoices
      .map(({ customerName }) => customerName?.trim())
      .filter(Boolean);

    return [...new Set(customerNames)]
      .filter((customerName) =>
        customerName.toLocaleLowerCase().includes(normalizedSearchTerm),
      )
      .sort((firstCustomer, secondCustomer) =>
        firstCustomer.localeCompare(secondCustomer),
      );
  }, [allInvoices, searchTerm]);

  const invoicesByCustomer = useMemo(() => {
    return allInvoices.reduce((groupedInvoices, invoice) => {
      const customerName = invoice.customerName?.trim();

      if (!customerName) {
        return groupedInvoices;
      }

      if (!groupedInvoices.has(customerName)) {
        groupedInvoices.set(customerName, []);
      }

      groupedInvoices.get(customerName).push(invoice);
      return groupedInvoices;
    }, new Map());
  }, [allInvoices]);

  const selectCustomer = useCallback(
    (customerName) => {
      const isClosing = selectedCustomer === customerName;

      setSelectedCustomer(isClosing ? null : customerName);
      setEditingPhoneNumber(isClosing ? '' : phoneNumbers[customerName] || '');
      setIsEditingPhoneNumber(false);
      setShowSuccessMessage(false);
    },
    [phoneNumbers, selectedCustomer],
  );

  const savePhoneNumber = useCallback(() => {
    if (!selectedCustomer) {
      return;
    }

    const phoneNumber = editingPhoneNumber.trim();

    setPhoneNumbers((currentPhoneNumbers) => ({
      ...currentPhoneNumbers,
      [selectedCustomer]: phoneNumber,
    }));
    setEditingPhoneNumber(phoneNumber);
    setIsEditingPhoneNumber(false);
    setShowSuccessMessage(true);
  }, [editingPhoneNumber, selectedCustomer]);

  const deletePhoneNumber = useCallback(() => {
    if (!selectedCustomer) {
      return;
    }

    setPhoneNumbers((currentPhoneNumbers) => {
      const updatedPhoneNumbers = { ...currentPhoneNumbers };
      delete updatedPhoneNumbers[selectedCustomer];
      return updatedPhoneNumbers;
    });
    setEditingPhoneNumber('');
    setIsEditingPhoneNumber(false);
    setShowSuccessMessage(false);
  }, [selectedCustomer]);

  const startEditingPhoneNumber = useCallback(() => {
    setEditingPhoneNumber(
      selectedCustomer ? phoneNumbers[selectedCustomer] || '' : '',
    );
    setIsEditingPhoneNumber(true);
    setShowSuccessMessage(false);
  }, [phoneNumbers, selectedCustomer]);

  const handleDownloadPDF = useCallback(
    (invoice) => {
      const isAlleghenyInvoice =
        invoice.invoiceType === 'allegheny' || alleghenyInvoiceIds.has(invoice.id);

      if (isAlleghenyInvoice) {
        generateAlleghenyPDF(invoice);
        return;
      }

      generateStandardPDF(invoice);
    },
    [alleghenyInvoiceIds],
  );

  return (
    <main className="customers-page">
      <h1 className="customers">Customers</h1>

      <label htmlFor="customer-search" className="visually-hidden">
        Search customers
      </label>
      <input
        id="customer-search"
        type="search"
        placeholder="Search by customer name"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="search-bar"
      />

      {isLoading && <p className="page-status">Loading customers…</p>}
      {!isLoading && loadError && (
        <p className="page-status page-status-error" role="alert">
          {loadError}
        </p>
      )}
      {!isLoading && !loadError && filteredCustomers.length === 0 && (
        <p className="page-status">
          {searchTerm ? 'No customers match your search.' : 'No customers found.'}
        </p>
      )}

      {!isLoading && !loadError && filteredCustomers.length > 0 && (
        <ul className="customer-list">
          {filteredCustomers.map((customerName) => {
            const isSelected = selectedCustomer === customerName;
            const customerInvoices = invoicesByCustomer.get(customerName) || [];
            const customerPanelId = `customer-${customerName
              .toLocaleLowerCase()
              .replace(/[^a-z0-9]+/g, '-')}`;

            return (
              <li key={customerName} className="customer-item">
                <button
                  type="button"
                  onClick={() => selectCustomer(customerName)}
                  className="customer-button"
                  aria-expanded={isSelected}
                  aria-controls={customerPanelId}
                >
                  {customerName}
                </button>

                {isSelected && (
                  <section id={customerPanelId} aria-label={`${customerName} details`}>
                    <div className="phone-number-section">
                      {isEditingPhoneNumber ? (
                        <>
                          <label htmlFor="customer-phone" className="visually-hidden">
                            Phone number for {customerName}
                          </label>
                          <input
                            id="customer-phone"
                            type="tel"
                            placeholder="Enter phone number"
                            value={editingPhoneNumber}
                            onChange={(event) =>
                              setEditingPhoneNumber(event.target.value)
                            }
                            className="phone-number-input"
                            autoComplete="tel"
                          />
                          <button
                            type="button"
                            onClick={savePhoneNumber}
                            className="save-phone-number-button"
                          >
                            Save Phone Number
                          </button>
                          {phoneNumbers[customerName] && (
                            <button
                              type="button"
                              onClick={deletePhoneNumber}
                              className="delete-phone-number-button"
                            >
                              Delete Phone Number
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="saved-phone-number">
                            <strong>Phone Number:</strong>{' '}
                            {phoneNumbers[customerName] || 'Not added'}
                          </span>
                          <button
                            type="button"
                            onClick={startEditingPhoneNumber}
                            className="edit-phone-number-button"
                          >
                            {phoneNumbers[customerName] ? 'Edit' : 'Add'}
                          </button>
                        </>
                      )}

                      {showSuccessMessage && (
                        <p className="success-message" role="status">
                          Phone number saved successfully.
                        </p>
                      )}
                    </div>

                    <ul className="invoice-list">
                      {customerInvoices.map((invoice, invoiceIndex) => (
                        <li
                          key={`${invoice.invoiceType}-${invoice.id || invoiceIndex}`}
                          className="invoice-item"
                        >
                          <div className="invoice-header">
                            <h2 className="invoice">Invoice {invoiceIndex + 1}</h2>
                          </div>

                          <div className="invoice-details">
                            <p>Customer Name: {invoice.customerName || 'N/A'}</p>
                            <p>Date: {invoice.date || 'N/A'}</p>
                            <p>Customer Location: {invoice.customerLocation || 'N/A'}</p>
                          </div>

                          <div className="invoice-products">
                            <h3>Products</h3>
                            {invoice.products?.length ? (
                              <ul>
                                {invoice.products.map((product, productIndex) => (
                                  <li
                                    key={`${product.name || 'product'}-${productIndex}`}
                                  >
                                    <p>Product: {product.name || 'N/A'}</p>
                                    <p>Quantity: {product.quantity ?? 'N/A'}</p>
                                    <p>
                                      Serial Numbers:{' '}
                                      {Array.isArray(product.serialNumbers) &&
                                      product.serialNumbers.length
                                        ? product.serialNumbers.join(', ')
                                        : 'N/A'}
                                    </p>
                                    <p>Unit Price: {formatCurrency(product.unitPrice)}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No products listed.</p>
                            )}
                          </div>

                          <div className="invoice-actions">
                            <button
                              type="button"
                              onClick={() => navigate(`/edit-invoice/${invoice.id}`)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(invoice)}
                            >
                              Download PDF
                            </button>
                          </div>

                          <p>Tax: {invoice.tax ?? 0}%</p>
                          <p>Total Price: {formatCurrency(invoice.totalPrice)}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};

export default CustomersPage;
