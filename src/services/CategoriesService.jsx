import api from './api';

// Obtener todas las categorías
export const getAllCategories = async () => {
    const response = await api.get('/api/personal/categories');
    return response.data;
};

// Obtener una categoría por ID
export const getCategoryById = async (id) => {
    const response = await api.get(`/api/personal/categories/${id}`);
    return response.data;
};

// Crear una nueva categoría
export const createCategory = async (category) => {
    const response = await api.post('/api/personal/categories', category);
    return response.data;
};

// Actualizar una categoría existente
export const updateCategory = async (id, updatedCategory) => {
    const response = await api.put(`/api/personal/categories/${id}`, updatedCategory);
    return response.data;
};

// Eliminar una categoría por ID
export const deleteCategory = async (id) => {
    await api.delete(`/api/personal/categories/${id}`);
};
