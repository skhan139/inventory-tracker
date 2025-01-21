// src/components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo-title">
        <img src="/assets/images/kmlogo.png" alt="Logo" className="navbar-logo" />
        <span className="navbar-title">K And M Inventory Tracker</span>
      </div>
      <button className="navbar-toggle" onClick={toggleNavbar}>
        ☰
      </button>
      <div className={`navbar-buttons ${isOpen ? 'open' : ''}`}>
        <ul className="navbar-list">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              <button className="navbar-button">Home</button>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/products" className="navbar-link">
              <button className="navbar-button">Products</button>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/create-invoice" className="navbar-link">
              <button className="navbar-button">Create Invoice</button>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/view-invoices" className="navbar-link">
              <button className="navbar-button">View Invoices</button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;