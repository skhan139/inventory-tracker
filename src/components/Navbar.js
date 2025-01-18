// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src="/public/images/kmlogo.ico" alt="Logo" className="navbar-logo" />
      <div className="navbar-buttons">
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;