import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Mock auth state - in a real app this would come from a context
const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null;
};

const RequireAuth = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
