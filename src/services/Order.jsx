import api from './api';

export const createRawMaterialOrder = async (orderData) => {
    try {
        const response = await api.post('/api/orders/create', orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllOrders = async () => {
    try {
        const response = await api.get('/api/orders');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getOrdersByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/orders/user/${userId}`);
        return response;
    } catch (error) {
        throw error;
    }
};
