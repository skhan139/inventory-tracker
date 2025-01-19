// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Welcome to KM Sales</h1>
      <p>Your one-stop shop for all things saleable.</p>
      <LoginForm />
      <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </div>
  );
};

export default HomePage;