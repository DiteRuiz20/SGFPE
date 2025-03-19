import api from './api';

// Obtener todos los gastos personales (usando el userId en el encabezado)
export const getPersonalExpenses = async (userId) => {
    const response = await api.get('/api/personal/expenses', {
        headers: {
            'User-ID': userId, // Enviar el userId en el encabezado
        },
    });
    return response.data;
};

// Obtener gastos personales por userId (nuevo método)
export const getPersonalExpensesByUserId = async (userId) => {
    const response = await api.get(`/api/personal/expenses/user/${userId}`);
    return response.data;
};

// Crear un nuevo gasto personal
export const createPersonalExpense = async (personalExpense) => {
    const response = await api.post('/api/personal/expenses', personalExpense);
    return response.data;
};