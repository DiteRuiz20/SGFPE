import api from './api';

export const getUsers = async () => {
    const response = await api.get('/api/personal/users');
    return response.data;
};

export const createUser = async (user) => {
    const response = await api.post('/api/personal/users', user);
    return response.data;
};
