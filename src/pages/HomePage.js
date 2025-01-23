import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home page after successful login
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="home-page">
      <div className="welcome-container">
        <h1 className="welcome">Welcome To The K&M Sales Database</h1>
        <p className="welcome">Sort Inventory, Create Invoices, And Browse Customer Info.</p>
      </div>
      {!currentUser && (
        <div className="login-page">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HomePage;