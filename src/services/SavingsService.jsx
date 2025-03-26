import api from './api';

export const getAllSavings = async () => {
    const response = await api.get('/api/personal/savings');
    return response.data;
};

export const getSavingsByUserId = async (userId) => {
    const response = await api.get(`/api/personal/savings/user/${userId}`);
    return response.data;
};

export const createSaving = async (saving) => {
    const response = await api.post('/api/personal/savings', saving);
    return response.data;
};