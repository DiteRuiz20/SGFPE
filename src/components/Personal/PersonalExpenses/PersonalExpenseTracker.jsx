import React, { useState, useEffect } from 'react';
import { getPersonalExpensesByUserId, createPersonalExpense } from '../../../services/PersonalExpensesService';
import { getAllCategories } from '../../../services/CategoriesService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrar los elementos necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PersonalExpensesTracker() {
    const [personalExpenses, setPersonalExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categories, setCategories] = useState([]);  // Estado para las categorías
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        categoryName: '',
    });  // Estado para el nuevo gasto
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

    // Obtener categorías para el selector
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();  // Llamada a la API para obtener las categorías
                setCategories(data);  // Establecemos las categorías en el estado
            } catch (error) {
                console.error('Error al obtener las categorías:', error);
            }
        };

        fetchCategories();
    }, []);

    // Manejar cambio en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExpense({
            ...newExpense,
            [name]: value,
        });
    };

    // Enviar el formulario para crear un nuevo gasto
    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        if (!userId) {
            navigate('/login-personal');
            return;
        }

        const expenseData = {
            ...newExpense,
            userId,
        };

        try {
            const createdExpense = await createPersonalExpense(expenseData);
            console.log('Gasto creado:', createdExpense);

            // Agregar el gasto recién creado al estado
            setPersonalExpenses((prevExpenses) => [...prevExpenses, createdExpense]);
            setFilteredExpenses((prevExpenses) => [...prevExpenses, createdExpense]);

            // Limpiar el formulario
            setNewExpense({
                description: '',
                amount: '',
                categoryId: '',
            });
        } catch (error) {
            console.error('Error al crear el gasto:', error);
        }
    };

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

            {/* Formulario para registrar un gasto */}
            <h2>Registrar un nuevo gasto</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Descripción:</label>
                    <input
                        type="text"
                        name="description"
                        value={newExpense.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Monto:</label>
                    <input
                        type="number"
                        name="amount"
                        value={newExpense.amount}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Categoría:</label>
                    <select
                        name="categoryId"  // 👈 Aquí también debe ser categoryId
                        value={newExpense.categoryId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Seleccione una categoría</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">Registrar Gasto</button>
            </form>

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
