import api from './api';

export const createRawMaterialOrder = async (orderData) => {
    try {
        const response = await api.post('/api/orders/create', orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
