import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RequireAuth = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a spinner
  }

  if (!user) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // User is logged in but doesn't have permission
    // Redirect to dashboard (which should handle showing limited view) or 403 page
    // Using Navigate to /dashboard as a safe default, or /unauthorized if we had one
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireAuth;
