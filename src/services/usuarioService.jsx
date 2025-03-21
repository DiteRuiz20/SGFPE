// Usuario.js
import axios from '../api/axios';  // Asegúrate de importar el archivo axios.js

export const obtenerUsuario = async () => {
    try {
        const response = await axios.get('/usuario');  // Endpoint para obtener datos del usuario
        return response.data;
    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        throw error;
    }
};
