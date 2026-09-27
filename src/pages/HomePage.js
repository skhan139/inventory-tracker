import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const { currentUser } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSigningIn(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch {
      setError('We couldn’t sign you in. Check your email and password.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="home-page">
      <div className="home-page__glow home-page__glow--one" />
      <div className="home-page__glow home-page__glow--two" />

      <section className="home-shell">
        <div className="welcome-panel">
          <div className="brand-mark" aria-hidden="true">
            K<span>&</span>M
          </div>

          <div className="welcome-content">
            <p className="eyebrow">Staff workspace</p>

            <h1>
              Everything your team needs,
              <span> all in one place.</span>
            </h1>

            <p className="welcome-description">
              Manage inventory, create invoices, and find customer
              information through one secure company workspace.
            </p>

            <div className="feature-list" aria-label="Portal features">
              <div className="feature">
                <span className="feature__icon">01</span>
                <span>Inventory management</span>
              </div>

              <div className="feature">
                <span className="feature__icon">02</span>
                <span>Invoice creation</span>
              </div>

              <div className="feature">
                <span className="feature__icon">03</span>
                <span>Customer records</span>
              </div>
            </div>
          </div>

          <p className="welcome-footer">
            K&amp;M Sales Database · Internal use only
          </p>
        </div>

        <div className="account-panel">
          {!currentUser ? (
            <div className="login-card">
              <div className="login-card__header">
                <p className="eyebrow">Secure access</p>
                <h2>Welcome back</h2>
                <p>Sign in with your company account to continue.</p>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    inputMode="email"
                    disabled={isSigningIn}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isSigningIn}
                    required
                  />
                </div>

                {error && (
                  <div className="error-message" role="alert">
                    <span aria-hidden="true">!</span>
                    <p>{error}</p>
                  </div>
                )}

                <button
                  className="login-button"
                  type="submit"
                  disabled={isSigningIn}
                >
                  <span>{isSigningIn ? 'Signing in…' : 'Sign in'}</span>
                  {!isSigningIn && <span aria-hidden="true">→</span>}
                </button>
              </form>

              <p className="support-copy">
                Having trouble signing in? Contact your administrator.
              </p>
            </div>
          ) : (
            <div className="login-card signed-in-card">
              <div className="signed-in-icon" aria-hidden="true">
                ✓
              </div>
              <p className="eyebrow">Authenticated</p>
              <h2>Welcome back</h2>
              <p>You’re signed in and ready to manage today’s work.</p>

              <button
                className="login-button"
                type="button"
                onClick={() => navigate('/dashboard')}
              >
                <span>Open dashboard</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;