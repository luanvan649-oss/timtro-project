import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

interface StoredUser {
  role?: string;
  [key: string]: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const stored = localStorage.getItem('currentUser');
  const currentUser: StoredUser | null = stored ? (JSON.parse(stored) as StoredUser) : null;

  if (!currentUser) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && currentUser.role && !allowedRoles.includes(currentUser.role)) {
    // User is logged in but does not have the required role, redirect to home or an unauthorized page
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
