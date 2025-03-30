import api from './api';

export const sendResetCode = async (email) => {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
};

export const resetPassword = async (email, code, newPassword) => {
    const response = await api.post('/auth/reset-password', {
        email,
        code,
        newPassword
    });
    return response.data;
};
