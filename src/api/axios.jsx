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
                const userId = await AsyncStorage.getItem('userId');
                
                console.log('Token recuperado:', token ? 'Presente' : 'No encontrado');
                console.log('UserId recuperado:', userId ? 'Presente' : 'No encontrado');
                console.log('URL de la petición:', config.url);
                
                if (!token) {
                    console.error('No se encontró token para la ruta:', config.url);
                    throw new Error('No hay token de autenticación');
                }

                // Asegurarse de que el token no tenga espacios extras
                const cleanToken = token.trim();
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${cleanToken}`,
                    'Content-Type': 'application/json',
                    'User-ID': userId // Agregar el userId en el header
                };
                
                console.log('Headers completos de la petición:', JSON.stringify(config.headers, null, 2));
                console.log('Datos de la petición:', JSON.stringify(config.data, null, 2));
            } catch (error) {
                console.error('Error en el interceptor:', error);
                throw error;
            }
        }
        return config;
    },
    error => {
        console.error('Error en el interceptor de request:', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    response => response,
    error => {
        console.error('Error en la respuesta:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        
        if (error.response?.status === 403) {
            console.error('Error de autorización. Token posiblemente expirado o inválido.');
            // Intentar refrescar el token si es necesario
            // Aquí podrías implementar la lógica de refresh token
        }
        return Promise.reject(error);
    }
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

export const createPersonalExpense = async (expenseData) => {
    try {
        const response = await api.post('/api/personal/expenses', expenseData);
        return response.data;
    } catch (error) {
        console.error('Error creating expense:', error);
        throw error;
    }
};

export const getDebtsByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/personal/debts/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching debts:', error);
        throw error;
    }
};

export const createDebt = async (debtData) => {
    try {
        const response = await api.post('/api/personal/debts', debtData);
        return response.data;
    } catch (error) {
        console.error('Error creating debt:', error);
        throw error;
    }
};

export const updateDebt = async (debtId, debtData) => {
    try {
        const response = await api.put(`/api/personal/debts/${debtId}`, debtData);
        return response.data;
    } catch (error) {
        console.error('Error updating debt:', error);
        throw error;
    }
};

export const deleteDebt = async (debtId) => {
    try {
        const response = await api.delete(`/api/personal/debts/${debtId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting debt:', error);
        throw error;
    }
};

export default api;
