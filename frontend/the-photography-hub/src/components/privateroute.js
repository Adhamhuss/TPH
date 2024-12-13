import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function PrivateRoute() {
  const isAuthenticated = document.cookie.includes('authToken'); // Check if the token exists

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  return <Outlet />; // Render the protected route's component
}

export default PrivateRoute;

