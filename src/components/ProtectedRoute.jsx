import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredAccountType }) => {
    const { isAuthenticated, accountType } = useAuth();
    const location = useLocation();

    // Si no está autenticado, redirigir al login correspondiente
    if (!isAuthenticated) {
        const loginPath = requiredAccountType === 'personal' ? '/login-personal' : '/login-empresarial';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Si el tipo de cuenta no coincide, redirigir a la página principal
    if (requiredAccountType && accountType !== requiredAccountType) {
        return <Navigate to="/" replace />;
    }

    // Si todo está bien, renderizar el componente protegido
    return children;
}; 