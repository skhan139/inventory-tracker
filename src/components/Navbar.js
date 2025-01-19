import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo-title">
        <img src="/public/images/kmlogo.ico" alt="Logo" className="navbar-logo" />
        <span className="navbar-title">K And M Inventory Tracker</span>
      </div>
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