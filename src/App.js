// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ViewInvoicesPage from './pages/ViewInvoicesPage';
import EditInvoicePage from './pages/EditInvoicePage';
import Navbar from './components/Navbar'; // Import Navbar
import { AuthProvider } from './context/AuthContext';
import { InvoicesProvider } from './context/InvoicesContext';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <InvoicesProvider>
          <Navbar /> {/* Add Navbar here */}
          <div className="app">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/create-invoice" element={<CreateInvoicePage />} />
              <Route path="/view-invoices" element={<ViewInvoicesPage />} />
              <Route path="/edit-invoice/:index" element={<EditInvoicePage />} />
            </Routes>
          </div>
        </InvoicesProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;