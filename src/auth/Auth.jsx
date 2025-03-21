import { login as loginUser } from '../auth/AuthContext';  // Utiliza la función login desde AuthContext
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email, password) => {
    try {
        const response = await loginUser(email, password);  // Usar login directamente desde el contexto

        if (response) {
            const token = await AsyncStorage.getItem('token');
            console.log('Login exitoso:', response);
            return response;
        }

        console.log('Error al hacer login');
        return false;
    } catch (error) {
        console.error('Error en el login:', error);
        throw error;
    }
};
