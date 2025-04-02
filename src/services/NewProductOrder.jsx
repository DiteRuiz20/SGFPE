import api from './api';

// Crear una nueva orden
export const createNewProductOrder = (data) => {
    return api.post('/api/new-product-orders', data);
};

// Obtener órdenes por usuario
export const getNewProductOrdersByUser = (userId) => {
    return api.get(`/api/new-product-orders/user/${userId}`);
};
