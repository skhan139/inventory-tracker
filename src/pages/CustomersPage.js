import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoicesContext';
import './CustomersPage.css';

const CustomersPage = () => {
  const { invoices, alleghenyCountyInvoices, fetchInvoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState({});
  const [editingPhoneNumber, setEditingPhoneNumber] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Combine standard and Allegheny County invoices
  const allInvoices = [...invoices, ...alleghenyCountyInvoices];

  // Get unique customer names from combined invoices
  const uniqueCustomers = Array.from(new Set(allInvoices.map(invoice => invoice.customerName)));

  // Filter customers based on search term
  const filteredCustomers = uniqueCustomers.filter(customer =>
    customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle customer click to show/hide their invoices
  const handleCustomerClick = (customer) => {
    setSelectedCustomer(selectedCustomer === customer ? null : customer);
    setEditingPhoneNumber(phoneNumbers[customer] || '');
    setShowSuccessMessage(false);
    setIsEditing(false);
  };

  // Handle phone number change
  const handlePhoneNumberChange = (e) => {
    setEditingPhoneNumber(e.target.value);
  };

  // Save phone number
  const savePhoneNumber = () => {
    setPhoneNumbers({
      ...phoneNumbers,
      [selectedCustomer]: editingPhoneNumber,
    });
    setShowSuccessMessage(true);
    setIsEditing(false);
  };

  // Update phone number
  const updatePhoneNumber = () => {
    setIsEditing(true);
    setShowSuccessMessage(false);
  };

  // Delete phone number
  const deletePhoneNumber = () => {
    const updatedPhoneNumbers = { ...phoneNumbers };
    delete updatedPhoneNumbers[selectedCustomer];
    setPhoneNumbers(updatedPhoneNumbers);
    setEditingPhoneNumber('');
    setShowSuccessMessage(false);
    setIsEditing(false);
  };

  // Get invoices for the selected customer
  const customerInvoices = selectedCustomer
    ? allInvoices.filter(invoice => invoice.customerName === selectedCustomer)
    : [];

  return (
    <div className="customers-page">
      <h1 className='customers'>Customers</h1>
      <input
        type="text"
        placeholder="Search by customer name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <ul className="customer-list">
        {filteredCustomers.map((customer, index) => (
          <li key={index} className="customer-item">
            <button onClick={() => handleCustomerClick(customer)} className="customer-button">
              {customer}
            </button>
            {selectedCustomer === customer && (
              <div>
                <div className="phone-number-section">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        placeholder="Enter phone number"
                        value={editingPhoneNumber}
                        onChange={handlePhoneNumberChange}
                        className="phone-number-input"
                      />
                      <button onClick={savePhoneNumber} className="save-phone-number-button">
                        Save Phone Number
                      </button>
                      <button onClick={deletePhoneNumber} className="delete-phone-number-button">
                        Delete Phone Number
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="saved-phone-number">
                        <strong>Phone Number:</strong> {phoneNumbers[selectedCustomer]}
                      </span>
                      <button onClick={updatePhoneNumber} className="edit-phone-number-button">
                        Edit
                      </button>
                    </>
                  )}
                  {showSuccessMessage && <p className="success-message">Phone number saved successfully</p>}
                </div>
                <ul className="invoice-list">
                  {customerInvoices.map((invoice, idx) => (
                    <li key={idx} className="invoice-item">
                      <button className="delete-invoice">X</button>
                      <div className="invoice-header">
                        <h2 className='invoice'>Invoice {idx + 1}</h2>
                      </div>
                      <div className="invoice-details">
                        <p>Customer Name: {invoice.customerName}</p>
                        <p>Date: {invoice.date}</p>
                        <p>Customer Location: {invoice.customerLocation}</p>
                      </div>
                      <div className="invoice-products">
                        <h3>Products:</h3>
                        <ul>
                          {invoice.products && invoice.products.map((product, productIdx) => (
                            <li key={productIdx}>
                              <p>Product: {product.name}</p>
                              <p>Quantity: {product.quantity}</p>
                              <p>Serial Numbers: {Array.isArray(product.serialNumbers) ? product.serialNumbers.join(', ') : 'N/A'}</p>
                              <p>Unit Price: ${product.unitPrice !== undefined ? product.unitPrice.toFixed(2) : 'N/A'}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="invoice-actions">
                        <button onClick={() => navigate(`/edit-invoice/${invoice.id}`)}>Edit</button>
                        <button>Download PDF</button>
                      </div>
                      <p>Tax: {invoice.tax}%</p>
                      <p>Total Price: ${invoice.totalPrice !== undefined ? invoice.totalPrice.toFixed(2) : 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomersPage;