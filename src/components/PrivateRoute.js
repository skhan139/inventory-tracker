// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ element: Element, ...rest }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Element {...rest} /> : <Navigate to="/" />;
};

export default PrivateRoute;