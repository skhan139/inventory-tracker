import React from 'react';
import { Link } from 'react-router-dom';
import './SelectInvoiceTypePage.css';

const SelectInvoiceTypePage = () => {
  return (
    <div className="select-invoice-type-page">
      <h1>Select Invoice Type</h1>
      <div className="button-container">
        <Link to="/create-invoice/allegheny-county">
          <button className="invoice-type-button">Create Allegheny County Invoice</button>
        </Link>
        <Link to="/create-invoice/standard">
          <button className="invoice-type-button">Create Standard Invoice</button>
        </Link>
      </div>
    </div>
  );
};

export default SelectInvoiceTypePage;