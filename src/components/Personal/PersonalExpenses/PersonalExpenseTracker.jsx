import React, { useEffect, useState } from 'react';
import { getPersonalExpensesByUserId } from '../../../services/PersonalExpensesService';
import { useNavigate } from 'react-router-dom';

export default function PersonalExpensesTracker() {
    const [personalExpenses, setPersonalExpenses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPersonalExpenses = async () => {
            const userId = localStorage.getItem('userId');

            if (!userId) {
                navigate('/login-personal'); // Redirige si no hay userId
                return;
            }

            try {
                const response = await getPersonalExpensesByUserId(userId);
                console.log('Gastos personales obtenidos:', response);
            
                if (!response || !Array.isArray(response)) {
                    console.warn('No hay gastos registrados para este usuario.');
                    setPersonalExpenses([]); // ✅ Evita crasheos
                    return;
                }
            
                const fetchedExpenses = response.map(expense => ({
                    ...expense,
                    category: expense.category || 'Sin categoría',
                }));
            
                setPersonalExpenses(fetchedExpenses);
            } catch (error) {
                console.error('Error al obtener los gastos personales:', error);
            }
        };

        fetchPersonalExpenses();
    }, [navigate]);

    return (
        <div>
            <h1>Gastos Personales</h1>
            {personalExpenses.length === 0 ? (
                <p>No hay gastos para mostrar.</p>
            ) : (
                <ul>
                    {personalExpenses.map(expense => (
                        <li key={expense.id}>
                            {expense.description} - ${expense.amount} ({expense.category})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
