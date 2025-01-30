import React, { useState, useEffect } from 'react';
import { useInvoices } from '../context/InvoicesContext';
import './CustomersPage.css';

const CustomersPage = () => {
  const { invoices, alleghenyCountyInvoices, fetchInvoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
              <ul className="invoice-list">
                {customerInvoices.map((invoice, idx) => (
                  <li key={idx} className="invoice-item">
                    <h3>Invoice {idx + 1}</h3>
                    <p><strong>Date:</strong> {invoice.date}</p>
                    <p><strong>Customer Location:</strong> {invoice.customerLocation}</p>
                    <h4>Products:</h4>
                    <ul>
                      {invoice.products && invoice.products.map((product, productIdx) => (
                        <li key={productIdx} className="product-item">
                          <p><strong>Product:</strong> {product.name}</p>
                          <p><strong>Quantity:</strong> {product.quantity}</p>
                          <p><strong>Serial Numbers:</strong> {Array.isArray(product.serialNumbers) ? product.serialNumbers.join(', ') : 'N/A'}</p>
                          <p><strong>Unit Price:</strong> ${product.unitPrice !== undefined ? product.unitPrice.toFixed(2) : 'N/A'}</p>
                        </li>
                      ))}
                    </ul>
                    <p><strong>Tax:</strong> {invoice.tax}%</p>
                    <p><strong>Total Price:</strong> ${invoice.totalPrice !== undefined ? invoice.totalPrice.toFixed(2) : 'N/A'}</p>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomersPage;