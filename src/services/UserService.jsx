import api from './api';

export const getUsers = async () => {
    const response = await api.get('/api/personal/users');
    return response.data;
};

export const getUser = async (id) => {
    try {
        const response = await api.get(`/api/personal/users/${id}`);
        console.log('Respuesta completa:', response);
        return response.data; // Axios maneja automáticamente el JSON
    } catch (error) {
        console.error('Error en getUser:', error);
        throw error;
    }
};  

export const createUser = async (user) => {
    const response = await api.post('/auth/register', user);
    return response.data;
};

export const updateUser = async (user) => {
    try {
        const response = await api.put(`/api/personal/users/${user.id}`, user);
        return response.data;
    } catch (error) {
        console.error('Error en updateUser:', error);
        throw error;
    }
};