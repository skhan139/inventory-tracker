// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Signup from './pages/Signup';
import { AuthProvider } from './context/AuthContext';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;