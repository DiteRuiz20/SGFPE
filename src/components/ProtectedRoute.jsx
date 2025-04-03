import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedAccountTypes }) => {
    const { isAuthenticated, accountType, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="text-center mt-5">Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedAccountTypes && !allowedAccountTypes.includes(accountType)) {
        return <Navigate to="/" replace />;
    }

    return children;
};
