import api from './api';

// Método para subir un archivo
export const uploadRawMaterial = (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    return api.post('/api/raw-materials/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// Método para crear un nuevo material
export const createRawMaterial = (data) => {
    return api.post('/api/raw-materials', data);
};

// Método para obtener materiales por usuario
export const getRawMaterialsByUser = (userId) => {
    const response = api.get(`/api/raw-materials/user/${userId}`);
    return response;
};

// Método para eliminar un material
export const deleteRawMaterial = (id) => {
    return api.delete(`/api/raw-materials/${id}`);
};

