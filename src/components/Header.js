// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../assets/images/kmlogo.png'; // Adjust the path to your logo file

const Header = () => {
  return (
    <header className="header">
      <img src={logo} alt="Logo" className="logo" />
      <nav className="nav-links">
        <Link to="/" className="button">Home</Link>
        <Link to="/products" className="button">Products</Link>
        <Link to="/create-invoice" className="button">Create Invoice</Link>
        <Link to="/view-invoices" className="button">View Invoices</Link>
      </nav>
    </header>
  );
};

export default Header;