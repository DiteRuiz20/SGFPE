import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        token: null,
        userId: null,
        accountType: null,
        isVerified: false,
        isLoading: true
    });

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                const accountType = localStorage.getItem('accountType');

                if (token && userId && accountType) {
                    setAuthState({
                        isAuthenticated: true,
                        token,
                        userId,
                        accountType,
                        isVerified: true,
                        isLoading: false
                    });
                } else {
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                logout();
            }
        };

        initializeAuth();
    }, []);

    const login = async (email, password, accountType) => {
        try {
            console.log(`Intentando login con: email=${email}, accountType=${accountType}`);

            // Validar tipo de cuenta
            const validateResponse = await api.post('/auth/validate-account', { email, accountType });
            console.log('Respuesta de validación:', validateResponse.data);

            if (!validateResponse.data.isValid) {
                const actualAccountType = validateResponse.data.accountType;
                if (actualAccountType) {
                    throw new Error(`Esta cuenta está registrada como ${actualAccountType}. Usa el login correspondiente.`);
                }
                throw new Error('El tipo de cuenta no es válido para este email.');
            }

            // Login con la API
            const loginUrl = `/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
            console.log('URL de login:', loginUrl);

            const response = await api.post(loginUrl);
            console.log('Respuesta del servidor login:', response.data);

            if (response.data.accountType !== accountType) {
                throw new Error(`Has iniciado sesión con una cuenta ${response.data.accountType}, pero usaste el login de ${accountType}.`);
            }

            if (!response.data.token) {
                throw new Error('No se recibió el token de autenticación');
            }

            const { token, userId } = response.data;

            // Guardar en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('accountType', accountType);

            // Actualizar estado
            setAuthState({
                isAuthenticated: true,
                token,
                userId,
                accountType,
                isVerified: true,
                isLoading: false
            });

            return true;
        } catch (error) {
            console.error('Error en login:', error);

            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message;

                if (status === 403) throw new Error('Credenciales incorrectas o tipo de cuenta inválido');
                if (status === 401) throw new Error('No autorizado. Verifica tus credenciales.');
                if (message) throw new Error(message);

                throw new Error(`Error del servidor (${status}): Intenta nuevamente`);
            } else if (error.request) {
                throw new Error('El servidor no responde. Verifica tu conexión.');
            } else {
                throw new Error(`Error de conexión: ${error.message}`);
            }
        }
    };

    const verifyAccount = async (email, verificationCode) => {
        try {
            const response = await api.post('/api/auth/verify-account', { email, verificationCode });
            if (response.data.verified) {
                setAuthState(prev => ({ ...prev, isVerified: true }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error en verificación:', error);
            throw error;
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('accountType');

            setAuthState({
                isAuthenticated: false,
                token: null,
                userId: null,
                accountType: null,
                isVerified: false,
                isLoading: false
            });
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                login,
                logout,
                verifyAccount,
                isPersonalUser: authState.accountType === 'personal',
                isRawMaterialBusiness: authState.accountType === 'business-raw-material',
                isNewProductsBusiness: authState.accountType === 'business-new-products-expenses'
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
