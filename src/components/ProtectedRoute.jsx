import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin can access all pages
  if (user?.role === 'admin') {
    return children;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user tries to access admin without admin role
    if (allowedRoles.includes('admin')) {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'You do not have permission to access this page.',
            timer: 2000,
            showConfirmButton: false
        });
        return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
