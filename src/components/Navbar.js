import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logo from '../assets/images/logo.png'; // Import the logo image

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const { currentUser } = useAuth();

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProtectedLinkClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo-title">
        <Link to="/">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>
        <span className="navbar-title">K And M Inventory Tracker</span>
      </div>
      <button className="navbar-toggle" onClick={toggleNavbar}>
        ☰
      </button>
      <div className={`navbar-buttons ${isOpen ? 'open' : ''}`}>
        <ul className="navbar-list">
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={handleProtectedLinkClick}>
              <button className="navbar-button">Home</button>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/products" className="navbar-link" onClick={handleProtectedLinkClick}>
              <button className="navbar-button">Products</button>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/create-invoice" className="navbar-link" onClick={handleProtectedLinkClick}>
              <button className="navbar-button">Create Invoice</button>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/view-invoices" className="navbar-link" onClick={handleProtectedLinkClick}>
              <button className="navbar-button">View Invoices</button>
            </Link>
          </li>
          <li className="navbar-item">
            <button className="navbar-button" onClick={handleSignOut}>Sign Out</button>
          </li>
        </ul>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>You need to login to access the database</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;