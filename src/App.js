// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ViewInvoicesPage from './pages/ViewInvoicesPage';
import EditInvoicePage from './pages/EditInvoicePage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage'; // Import SuppliersPage
import SelectInvoiceTypePage from './pages/SelectInvoiceTypePage'; // Import SelectInvoiceTypePage
import CreateAlleghenyCountyInvoicePage from './pages/CreateAlleghenyCountyInvoicePage'; // Import CreateAlleghenyCountyInvoicePage
import RevenuePage from './pages/RevenuePage'; // Import RevenuePage
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { InvoicesProvider } from './context/InvoicesContext';
import LoginPage from './pages/LoginPage';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <InvoicesProvider>
          <Navbar />
          <div className="app"> {/* Ensure this div uses the .app class */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<PrivateRoute element={ProductsPage} />} />
              <Route path="/create-invoice" element={<PrivateRoute element={SelectInvoiceTypePage} />} /> {/* Route for SelectInvoiceTypePage */}
              <Route path="/create-invoice/standard" element={<PrivateRoute element={CreateInvoicePage} />} /> {/* Route for CreateInvoicePage */}
              <Route path="/create-invoice/allegheny-county" element={<PrivateRoute element={CreateAlleghenyCountyInvoicePage} />} /> {/* Route for CreateAlleghenyCountyInvoicePage */}
              <Route path="/view-invoices" element={<PrivateRoute element={ViewInvoicesPage} />} />
              <Route path="/edit-invoice/:id" element={<PrivateRoute element={EditInvoicePage} />} /> {/* Ensure this route is correct */}
              <Route path="/customers" element={<PrivateRoute element={CustomersPage} />} />
              <Route path="/suppliers" element={<PrivateRoute element={SuppliersPage} />} /> {/* Add route for SuppliersPage */}
              <Route path="/revenue" element={<PrivateRoute element={RevenuePage} />} /> {/* Add route for RevenuePage */}
            </Routes>
          </div>
        </InvoicesProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;