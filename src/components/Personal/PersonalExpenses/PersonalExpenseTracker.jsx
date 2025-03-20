import React, { useEffect, useState } from 'react';
import { getPersonalExpensesByUserId } from '../../../services/PersonalExpensesService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrar los elementos necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PersonalExpensesTracker() {
    const [personalExpenses, setPersonalExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const navigate = useNavigate();

    // Cargar los gastos
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
                    setFilteredExpenses([]); // ✅ Evita crasheos también en los gastos filtrados
                    return;
                }

                const fetchedExpenses = response.map(expense => ({
                    ...expense,
                    categoryName: expense.categoryName || 'Sin categoría',
                }));

                setPersonalExpenses(fetchedExpenses);
                setFilteredExpenses(fetchedExpenses); // Inicializa los gastos filtrados
            } catch (error) {
                console.error('Error al obtener los gastos personales:', error);
            }
        };

        fetchPersonalExpenses();
    }, [navigate]);

    // Preparar los datos para el gráfico de pastel
    const categoryData = () => {
        const categoryCounts = personalExpenses.reduce((acc, expense) => {
            const categoryName = expense.categoryName || 'Sin categoría';
            acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
            return acc;
        }, {});

        const labels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#F5A623', '#F9A825', '#8E24AA'],
                    hoverOffset: 4,
                },
            ],
        };
    };

    // Filtrar los gastos cuando se selecciona una categoría en el gráfico de pastel
    const handleCategoryClick = (event, elements) => {
        if (elements.length > 0) {
            const categoryName = categoryData().labels[elements[0].index];
            const filtered = personalExpenses.filter(expense => expense.categoryName === categoryName);
            setFilteredExpenses(filtered); // Actualiza los gastos filtrados
        }
    };

    // Definir las columnas
    const columns = [
        {
            name: 'Fecha',
            selector: row => new Date(row.date).toLocaleString(),
            sortable: true,
        },
        {
            name: 'Monto',
            selector: row => row.amount,
            sortable: true,
            right: true,
        },
        {
            name: 'Descripción',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
        },
        {
            name: 'User ID',
            selector: row => row.userId,
            sortable: true,
        },
        {
            name: 'Category',
            selector: row => row.categoryName,
            sortable: true,
        },
        {
            name: 'Category ID',
            selector: row => row.categoryId,
            sortable: true,
        }
    ];

    return (
        <div>
            <h1>Gastos Personales</h1>
            
            {personalExpenses.length === 0 ? (
                <p>No hay gastos para mostrar.</p>
            ) : (
                <ul>
                    {personalExpenses.map(expense => (
                        <li key={expense.id}>
                            {expense.description} - ${expense.amount} ({expense.categoryName})
                        </li>
                    ))}
                </ul>
            )}

            {/* Gráfico de pastel de categorías */}
            <h2>Distribución de Gastos por Categoría</h2>
            <Pie
                data={categoryData()}
                onElementsClick={handleCategoryClick} // Agrega el manejador de clics
            />

            <h2>Tabla de Gastos</h2>
            <DataTable
                columns={columns}
                data={filteredExpenses}
                pagination
            />
        </div>
    );
}
