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
      <div className="rules-section">
        <h1>Rules, Regulations, and Taxes</h1>
        <div className="rules-container">
          <div className="rule">
            <h2>Bars And Restaurants</h2>
            <ul>
              <li>20% Standard Tax For WV Customers + 6% Raffle Tax</li>
              <li>No tax on merchandise (Boards), but everything else is taxed</li>
              <li>All items need serial numbers on invoices</li>
            </ul>
          </div>
          <div className="rule">
            <h2>West Virginia</h2>
            <ul>
              <li>20% Tax on all items</li>
              <li>All games must have a serial number, each number should be put on the invoice</li>
              <li>Merchandise items (Boards) are not taxed </li>
            </ul>
          </div>
          <div className="rule">
            <h2>Allegheny County</h2>
            <ul>
              <li>All games must have a serial and sticker number</li>
            </ul>
          </div>
          <div className="rule">
            <h2>Garrett County Taxes</h2>
            <ul>
              <li>No taxes</li>
              <li>No serial numbers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectInvoiceTypePage;