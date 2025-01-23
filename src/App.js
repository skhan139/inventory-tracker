import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ViewInvoicesPage from './pages/ViewInvoicesPage';
import EditInvoicePage from './pages/EditInvoicePage';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { InvoicesProvider } from './context/InvoicesContext';
import LoginPage from './pages/LoginPage'; // Import LoginPage
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <InvoicesProvider>
          <Navbar />
          <div className="app">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} /> {/* Add route for LoginPage */}
              <Route path="/products" element={<PrivateRoute element={ProductsPage} />} />
              <Route path="/create-invoice" element={<PrivateRoute element={CreateInvoicePage} />} />
              <Route path="/view-invoices" element={<PrivateRoute element={ViewInvoicesPage} />} />
              <Route path="/edit-invoice/:index" element={<PrivateRoute element={EditInvoicePage} />} />
            </Routes>
          </div>
        </InvoicesProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;