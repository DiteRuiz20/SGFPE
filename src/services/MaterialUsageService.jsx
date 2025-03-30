import api from './api';


export const createMaterialUsage = async (usageData) => {
    try {
        const response = await api.post('/api/material-usage/create', usageData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllMaterialUsages = async () => {
    try {
        const response = await api.get('/api/material-usage');
        return response.data; // Devuelve solo los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Función para obtener registros de uso de materiales por userId
export const getMaterialUsagesByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/material-usage/user/${userId}`);
        return response; // Devuelve solo los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

// Función para eliminar un registro de uso de materiales
export const deleteMaterialUsage = async (id) => {
    try {
        const response = await api.delete(`/api/material-usage/${id}`);
        return response.data; // Devuelve solo los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};

//Funcion para obtener los materiales disponibles por usuario
export const getAvailableMaterialsByUserId = async (userId) => {
    try {
        const response = await api.get(`/api/material-usage/available/${userId}`);
        return response; // Devuelve solo los datos de la respuesta
    } catch (error) {
        throw error; // Lanza el error para manejarlo en el componente
    }
};