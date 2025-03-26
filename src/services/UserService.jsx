import api from './api';

export const getUsers = async () => {
    const response = await api.get('/api/personal/users');
    return response.data;
};

const getUser = async (id) => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user data');
    return await response.json();
};  

export const createUser = async (user) => {
    const response = await api.post('/api/personal/users/register', user);
    return response.data;
};

export const updateUser = async (user) => {
    const response = await api.put('/api/personal/users', user);
    return response.data;
};