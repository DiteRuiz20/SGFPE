import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { useNavigation } from '@react-navigation/native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        token: null,
        userId: null,
        accountType: null
    });

    // Cargar el estado inicial desde AsyncStorage
    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const [token, userId, accountType] = await Promise.all([
                    AsyncStorage.getItem('token'),
                    AsyncStorage.getItem('userId'),
                    AsyncStorage.getItem('accountType')
                ]);

                if (token && userId) {
                    setAuthState({
                        isAuthenticated: true,
                        token,
                        userId,
                        accountType
                    });
                }
            } catch (error) {
                console.error('Error loading stored auth:', error);
            }
        };

        loadStoredAuth();
    }, []);

    const validateAccount = async (email, accountType) => {
        try {
            const response = await api.post('/auth/validate-account', {
                email,
                accountType
            });

            return response.data.isValid;
        } catch (error) {
            console.error('Error validating account:', error);
            return false;
        }
    };

    const login = async (email, password, accountType) => {
        try {
            // Primero validamos el tipo de cuenta
            const isValidAccount = await validateAccount(email, accountType);
            
            if (!isValidAccount) {
                const errorMessage = accountType === 'personal' 
                    ? 'This email is registered as a business account. Please use the business login.'
                    : 'This email is registered as a personal account. Please use the personal login.';
                throw new Error(errorMessage);
            }

            // Si el tipo de cuenta es válido, procedemos con el login
            const response = await api.post('/auth/login', null, {
                params: {
                    email,
                    password
                }
            });
    
            const { token, userId, accountType: responseAccountType } = response.data;
    
            if (!token) {
                throw new Error('Token not received');
            }
    
            // Guardar datos en AsyncStorage
            await Promise.all([
                AsyncStorage.setItem('token', token),
                AsyncStorage.setItem('userId', userId),
                AsyncStorage.setItem('accountType', responseAccountType)
            ]);
    
            // Actualizar el estado
            setAuthState({
                isAuthenticated: true,
                token,
                userId,
                accountType: responseAccountType
            });
    
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await Promise.all([
                AsyncStorage.removeItem('token'),
                AsyncStorage.removeItem('userId'),
                AsyncStorage.removeItem('accountType')
            ]);

            setAuthState({
                isAuthenticated: false,
                token: null,
                userId: null,
                accountType: null
            });
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider 
            value={{ 
                ...authState,
                login,
                logout,
                isPersonalUser: authState.accountType === 'personal',
                isBusinessUser: authState.accountType === 'business'
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
