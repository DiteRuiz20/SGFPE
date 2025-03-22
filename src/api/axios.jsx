import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Instancia de Axios para configurar la base URL
const api = axios.create({
    baseURL: 'http://192.168.100.52:8080',  // Asegúrate de que esta es la URL correcta
});

// Interceptor para agregar el token JWT en los encabezados
api.interceptors.request.use(
    async config => {
        // Rutas que no requieren token
        const noAuthRoutes = ['/auth/login', '/auth/validate-account', '/register', '/forgot-password'];
        
        if (!noAuthRoutes.includes(config.url)) {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error retrieving auth token:', error);
            }
        }
        return config;
    },
    error => Promise.reject(error)
);

// Funciones de API
export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/api/personal/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const getPersonalExpensesByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/personal/expenses/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }
};

export const getAllCategories = async () => {
    try {
        const response = await api.get('/api/personal/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export default api;
