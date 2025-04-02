import api from './api';

// ✅ Subir Excel de productos nuevos
export const uploadNewProductExpenses = (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    return api.post('/api/new-product-expenses/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// ✅ Crear un producto manualmente (si lo permites)
export const createNewProductExpense = (data) => {
    return api.post('/api/new-product-expenses', data);
};

// ✅ Obtener productos por usuario
export const getNewProductExpensesByUser = (userId) => {
    return api.get(`/api/new-product-expenses/user/${userId}`);
};

// ✅ Eliminar un producto
export const deleteNewProductExpense = (id) => {
    return api.delete(`/api/new-product-expenses/${id}`);
};
