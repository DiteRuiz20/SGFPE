import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Instancia de Axios para configurar la base URL
const api = axios.create({
    baseURL: 'http://192.168.109.46:8080',  // Asegúrate de que esta es la URL correcta
});

// Interceptor para agregar el token JWT en los encabezados
api.interceptors.request.use(
    async config => {
        // Rutas que no requieren token
        const noAuthRoutes = ['/auth/login', '/auth/validate-account', '/auth/register', '/auth/verify-code', '/auth/resend-code', '/auth/request-password-reset', '/auth/reset-password'];

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

export const getSavingsByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/personal/savings/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching savings:', error);
        throw error;
    }
};

export const createSaving = async (savingData) => {
    try {
        const response = await api.post('/api/personal/savings', savingData);
        return response.data;
    } catch (error) {
        console.error('Error creating saving:', error);
        throw error;
    }
};

export const createNewProductExpense = async (productData) => {
    try {
        const response = await api.post('/api/new-product-expenses', productData);
        return response.data;
    } catch (error) {
        console.error('Error creating new product expense:', error);
        throw error;
    }
};

export const getNewProductExpensesByUser = async (userId) => {
    try {
        const response = await api.get(`/api/new-product-expenses/user/${userId}`);
        return response;
    } catch (error) {
        console.error('Error fetching new product expenses:', error);
        throw error;
    }
};

// Crear nueva materia prima manualmente
export const createRawMaterial = async (data) => {
    try {
        const response = await api.post('/api/raw-materials', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear materia prima:', error);
        throw error;
    }
};

// Obtener materias primas por usuario
export const getRawMaterialsByUser = async (userId) => {
    try {
        const response = await api.get(`/api/raw-materials/user/${userId}`);
        return response;
    } catch (error) {
        console.error('Error al obtener materias primas del usuario:', error);
        throw error;
    }
};

// Eliminar materia prima
export const deleteRawMaterial = async (id) => {
    try {
        const response = await api.delete(`/api/raw-materials/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar materia prima:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Verifica el código de 6 dígitos para activar la cuenta
export const verifyCode = async ({ email, code }) => {
    try {
        const response = await api.post('/auth/verify-code', { email, code });
        return response.data;
    } catch (error) {
        console.error('Error verifying code:', error);
        throw error;
    }
};

// Reenvía el código de verificación al correo
export const resendCode = async ({ email }) => {
    try {
        const response = await api.post('/auth/resend-code', { email });
        return response.data;
    } catch (error) {
        console.error('Error resending code:', error);
        throw error;
    }
};

// Crear un consumo de materia prima (material usage)
export const createMaterialUsage = async (usageData) => {
    try {
        const response = await api.post('/api/material-usage/create', usageData);
        return response.data;
    } catch (error) {
        console.error('Error al crear uso de material:', error);
        throw error;
    }
};

// Obtener todos los usos de materiales por userId
export const getMaterialUsagesByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/material-usage/user/${userId}`);
        return response;
    } catch (error) {
        console.error('Error al obtener usos de materiales:', error);
        throw error;
    }
};

export const createRawMaterialOrder = async (orderData) => {
    try {
        const response = await api.post('/api/orders/create', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating raw material order:', error);
        throw error;
    }
};

export const getAllOrders = async () => {
    try {
        const response = await api.get('/api/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const getOrdersByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/orders/user/${userId}`);
        return response;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const getAvailableMaterialsByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/material-usage/available/${userId}`);
        return response;
    } catch (error) {
        console.error('Error fetching available materials:', error);
        throw error;
    }
}

export const createNewProductOrder = async (orderData) => {
    try {
        const response = await api.post('/api/new-product-orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating new product order:', error);
        throw error;
    }
};

export const getNewProductOrdersByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/new-product-orders/user/${userId}`);
        return response;
    } catch (error) {
        console.error('Error fetching new product orders:', error);
        throw error;
    }
};

export const sendResetCode = async (email) => {
    try {
        const response = await api.post('/auth/request-password-reset', { email });
        return response.data;
    } catch (error) {
        console.error('Error sending reset code:', error);
        throw error;
    }
};

export const resetPassword = async (email, code, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', { email, code, newPassword });
        return response.data;
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
};

export default api;
