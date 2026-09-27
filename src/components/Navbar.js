import React, { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInvoiceMenuOpen, setIsInvoiceMenuOpen] =
    useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const { currentUser } = useAuth();

  /*
   * Close navigation menus after the route changes.
   */
  useEffect(() => {
    setIsOpen(false);
    setIsInvoiceMenuOpen(false);
  }, [location.pathname]);

  /*
   * Allow the login dialog to be closed with Escape.
   */
  useEffect(() => {
    if (!showPopup) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowPopup(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showPopup]);

  const toggleNavbar = () => {
    setIsOpen((currentValue) => !currentValue);
  };

  const toggleInvoiceMenu = () => {
    setIsInvoiceMenuOpen((currentValue) => !currentValue);
  };

  const handleProtectedLinkClick = (event) => {
    if (!currentUser) {
      event.preventDefault();
      setShowPopup(true);
      setIsOpen(false);
      setIsInvoiceMenuOpen(false);
      return;
    }

    setIsOpen(false);
    setIsInvoiceMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut(auth);
      setIsOpen(false);
      setIsInvoiceMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const goToLogin = () => {
    setShowPopup(false);
    navigate('/login');
  };

  const getNavLinkClass = ({ isActive }) =>
    `navbar-link${isActive ? ' active' : ''}`;

  const invoiceRouteIsActive =
    location.pathname.startsWith('/create-invoice') ||
    location.pathname.startsWith('/view-invoices') ||
    location.pathname.startsWith('/edit-invoice');

  return (
    <>
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-inner">
          <Link
            to="/"
            className="navbar-brand"
            aria-label="K and M Database home"
            onClick={() => setIsOpen(false)}
          >
            <span className="navbar-logo-wrapper">
              <img
                src={logo}
                alt=""
                className="navbar-logo"
              />
            </span>

            <span className="navbar-brand-copy">
              <span className="navbar-title">K&amp;M</span>
              <span className="navbar-subtitle">
                Staff Database
              </span>
            </span>
          </Link>

          <button
            type="button"
            className={`navbar-toggle ${
              isOpen ? 'is-open' : ''
            }`}
            onClick={toggleNavbar}
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            aria-label={
              isOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
          >
            <span />
            <span />
            <span />
          </button>

          <div
            id="primary-navigation"
            className={`navbar-buttons ${
              isOpen ? 'open' : ''
            }`}
          >
            <ul className="navbar-list">
              <li className="navbar-item">
                <NavLink
                  to="/"
                  end
                  className={getNavLinkClass}
                  onClick={handleProtectedLinkClick}
                >
                  Home
                </NavLink>
              </li>

              <li className="navbar-item">
                <NavLink
                  to="/products"
                  className={getNavLinkClass}
                  onClick={handleProtectedLinkClick}
                >
                  Inventory
                </NavLink>
              </li>

              <li
                className={`navbar-item dropdown ${
                  isInvoiceMenuOpen ? 'open' : ''
                }`}
              >
                <button
                  type="button"
                  className={`navbar-link navbar-dropdown-toggle ${
                    invoiceRouteIsActive ? 'active' : ''
                  }`}
                  onClick={toggleInvoiceMenu}
                  aria-expanded={isInvoiceMenuOpen}
                  aria-controls="invoice-navigation"
                >
                  <span>Invoices</span>
                  <span
                    className="dropdown-chevron"
                    aria-hidden="true"
                  />
                </button>

                <div
                  id="invoice-navigation"
                  className="dropdown-menu"
                >
                  <NavLink
                    to="/create-invoice"
                    className={getNavLinkClass}
                    onClick={handleProtectedLinkClick}
                  >
                    <span className="dropdown-link-icon">
                      +
                    </span>

                    <span>
                      <strong>Create Invoice</strong>
                      <small>Start a new invoice</small>
                    </span>
                  </NavLink>

                  <NavLink
                    to="/view-invoices"
                    className={getNavLinkClass}
                    onClick={handleProtectedLinkClick}
                  >
                    <span className="dropdown-link-icon">
                      ↗
                    </span>

                    <span>
                      <strong>View Invoices</strong>
                      <small>Search previous records</small>
                    </span>
                  </NavLink>
                </div>
              </li>

              <li className="navbar-item">
                <NavLink
                  to="/customers"
                  className={getNavLinkClass}
                  onClick={handleProtectedLinkClick}
                >
                  Customers
                </NavLink>
              </li>

              <li className="navbar-item">
                <NavLink
                  to="/suppliers"
                  className={getNavLinkClass}
                  onClick={handleProtectedLinkClick}
                >
                  Suppliers
                </NavLink>
              </li>

              <li className="navbar-item">
                <NavLink
                  to="/revenue"
                  className={getNavLinkClass}
                  onClick={handleProtectedLinkClick}
                >
                  Revenue
                </NavLink>
              </li>
            </ul>

            <div className="navbar-account">
              {currentUser ? (
                <button
                  type="button"
                  className="navbar-signout"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <span className="account-status" />

                  <span>
                    {isSigningOut
                      ? 'Signing out…'
                      : 'Sign out'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="navbar-signin"
                  onClick={goToLogin}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showPopup && (
        <div
          className="navbar-popup"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePopup();
            }
          }}
        >
          <div
            className="navbar-popup-content"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-required-title"
            aria-describedby="login-required-description"
          >
            <div
              className="navbar-popup-icon"
              aria-hidden="true"
            >
              !
            </div>

            <p className="navbar-popup-eyebrow">
              Restricted access
            </p>

            <h2 id="login-required-title">
              Sign in required
            </h2>

            <p id="login-required-description">
              You need to sign in with your company account
              before accessing the staff database.
            </p>

            <div className="navbar-popup-actions">
              <button
                type="button"
                className="popup-primary-button"
                onClick={goToLogin}
                autoFocus
              >
                Go to sign in
              </button>

              <button
                type="button"
                className="popup-secondary-button"
                onClick={closePopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;