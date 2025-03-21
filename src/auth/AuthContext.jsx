import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);

    const login = async (email, password) => {
        try {
            // Usamos query parameters en la URL como en Postman
            const response = await api.post(`/auth/login`, null,
                {
                    params: {
                        email,
                        password
                    }
                }
            );
    
            const { token, userId } = response.data;
    
            // Verificar si el token está presente
            if (!token) {
                throw new Error('Token no recibido');
            }
    
            // Guardar token y userId en AsyncStorage
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userId', userId);
    
            // Actualizar el estado en el contexto
            setToken(token);
            setUserId(userId);
            setIsAuthenticated(true);
    
            return true;
        } catch (error) {
            console.error('Error en el login:', error.message);
            console.log(response.data);
            return false;
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userId');

        setToken(null);
        setUserId(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
