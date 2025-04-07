import React, { useState, useEffect } from 'react';
import { getPersonalExpensesByUserId } from '../../../services/PersonalExpensesService';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend as ChartJSLegend } from 'chart.js';
import { getSavingsByUserId } from '../../../services/SavingsService';
import { getDebtsByUserId } from '../../../services/DebtsService';
import MonthSelector from '../../MonthSelector';
import TopNavBar from './TopNavBar';

ChartJS.register(ArcElement, Tooltip, ChartJSLegend);

export default function PersonalGraphics() {
  const [personalExpenses, setPersonalExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [debts, setDebts] = useState([]);
  const [savings, setSavings] = useState([]);
  const [personalSavings, setPersonalSavings] = useState([]);
  const [personalDebts, setPersonalDebts] = useState([]);
  
  // Configuración para el selector de fechas
  const [dateWindow, setDateWindow] = useState({
    center: new Date(), // Fecha central (actual)
    offset: 3,           // Número de meses a cada lado (total: 2*range + 1)
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si dos fechas pertenecen al mismo mes
  const isSameMonth = (date1, date2) => {
    return (
      new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
      new Date(date1).getMonth() === new Date(date2).getMonth()
    );
  };

  // Función para generar los meses en el selector
  const generateMonths = () => {
    const { center, range } = dateWindow;
    const centerDate = new Date(center);
    const months = [];
    
    // Generar meses desde (center - range) hasta (center + range)
    for (let i = -range; i <= range; i++) {
      const date = new Date(centerDate);
      date.setMonth(centerDate.getMonth() + i);
      
      months.push({
        label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
        date,
        isStart: i === -range,
        isEnd: i === range
      });
    }
    
    return months;
  };

  // Generar los meses visibles
  const months = generateMonths();

  // Manejar la selección de un mes
  const handleMonthSelect = (monthObj) => {
    setSelectedMonth(monthObj.date);
    
    // Si selecciona un mes en los extremos, desplazar la ventana
    if (monthObj.isStart) {
      // Desplazar ventana hacia atrás (3 meses más hacia el pasado)
      const newCenter = new Date(dateWindow.center);
      newCenter.setMonth(newCenter.getMonth() - 3);
      setDateWindow(prev => ({
        ...prev,
        center: newCenter
      }));
    } else if (monthObj.isEnd) {
      // Desplazar ventana hacia adelante (3 meses más hacia el futuro)
      const newCenter = new Date(dateWindow.center);
      newCenter.setMonth(newCenter.getMonth() + 3);
      setDateWindow(prev => ({
        ...prev,
        center: newCenter
      }));
    }
  };

  // Filtrar los gastos por el mes seleccionado
  useEffect(() => {
    if (personalExpenses.length > 0) {
      const filtered = personalExpenses.filter(exp =>
        isSameMonth(exp.date, selectedMonth)
      );
      setFilteredExpenses(filtered);
    }
  }, [personalExpenses, selectedMonth]);

  // Cargar los gastos
  useEffect(() => {
    const fetchPersonalExpenses = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login-personal');
        return;
      }

      try {
        const response = await getPersonalExpensesByUserId(userId);
        console.log('Gastos personales obtenidos:', response);

        if (!response || !Array.isArray(response)) {
          console.warn('No hay gastos registrados para este usuario.');
          setPersonalExpenses([]);
          setFilteredExpenses([]);
          return;
        }

        const fetchedExpenses = response.map(expense => ({
          ...expense,
          categoryName: expense.categoryName || 'Sin categoría',
        }));

        setPersonalExpenses(fetchedExpenses);
        setFilteredExpenses(fetchedExpenses.filter(exp => 
          isSameMonth(exp.date, selectedMonth)
        ));
      } catch (error) {
        console.error('Error al obtener los gastos personales:', error);
      }
    };

    fetchPersonalExpenses();
  }, [navigate]);

  // Obtener datos de deudas y ahorros
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const [expensesResponse, savingsResponse, debtsResponse] = await Promise.all([
          getPersonalExpensesByUserId(userId),
          getSavingsByUserId(userId),
          getDebtsByUserId(userId)
        ]);
        setPersonalExpenses(expensesResponse);
        setPersonalSavings(savingsResponse);
        setPersonalDebts(debtsResponse);

        console.log('Deudas:', debtsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Calcular totales de deudas y ahorros del mes seleccionado
  const calculateTotals = () => {
    if (!Array.isArray(personalDebts) || !Array.isArray(personalSavings)) return [];
  
    const selectedMonthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const selectedMonthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
  
    const totalDebts = personalDebts
      .filter(debt => {
        const debtDate = new Date(debt.date);
        return (
          debtDate.getTime() >= selectedMonthStart.getTime() &&
          debtDate.getTime() <= selectedMonthEnd.getTime() + 86400000 // +1 día para incluir todo el día
        );
      })
      .reduce((sum, debt) => sum + (debt.amount || 0), 0);
  
    const totalSavings = personalSavings
      .filter(saving => {
        const savingDate = new Date(saving.date);
        return (
          savingDate.getTime() >= selectedMonthStart.getTime() &&
          savingDate.getTime() <= selectedMonthEnd.getTime() + 86400000
        );
      })
      .reduce((sum, saving) => sum + (saving.amount || 0), 0);
  
    if (totalDebts === 0 && totalSavings === 0) return [];
  
    return [
      { name: 'Debts', value: totalDebts, color: 'rgb(177, 177, 177)' },
      { name: 'Savings', value: totalSavings, color: 'rgb(61, 201, 167)' }
    ];
  };
  
  const categoryColors = {
    Comida: '#ff6347',
    Vestimenta: '#4682b4',
    Transporte: '#32cd32',
    Hogar: '#ff8c00',
    Entretenimiento: '#8a2be2',
    Salud: '#3cb371',
    Educación: '#f4a300',
    'Sin categoría': '#808080',
  };  

  // Preparar los datos para el gráfico de pastel basado en los gastos filtrados
  const categoryData = () => {
    const categoryCounts = filteredExpenses.reduce((acc, expense) => {
      const categoryName = expense.categoryName || 'Sin categoría';
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {});
  
    return Object.keys(categoryCounts).map(categoryName => {
      const color = categoryColors[categoryName] || '#808080';
      return {
        name: categoryName,
        value: categoryCounts[categoryName],
        color: color,
      };
    });
  };

  const styles = {
    divider: {
      width: '100%',
      height: '2px',
      backgroundColor: '#999',
      marginTop: 20,
    },
    expensesTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#30437A',
      textAlign: 'center',
    }
  };

  return (
    <div>
      <div className="row justify-content-center">
        <TopNavBar/>
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
          dateWindow={dateWindow}
          setDateWindow={setDateWindow}
        />
        <Divider style={styles.divider} />
      </div>
  
      <div className='row mt-3'>
        <div className='col-sm-6 d-flex flex-column justify-content-center align-items-center mb-5'>
          <p style={styles.expensesTitle}>DEUDAS VS AHORROS</p>
          {categoryData().length > 0 ? (
            <PieChart width={400} height={450}>
              <Pie
                data={calculateTotals()}
                dataKey="value"
                nameKey="name"
                cx={'50%'}
                cy={'50%'}
                innerRadius={80}
                outerRadius={120}
                label
              >
                {calculateTotals().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                align="center"
                verticalAlign="bottom"
                layout="vertical"
                iconType="plainline"
                iconSize={15}
              />    
            </PieChart>
          ) : (
            <p style={{ textAlign: "center", fontSize: "16px", color: "gray" }}>
              No hay información disponible.
            </p>
          )}
        </div>

        <div className='col-sm-6 d-flex flex-column justify-content-center align-items-center mb-5'>
          <p style={styles.expensesTitle}>GASTOS</p>
          {categoryData().length > 0 ? (
            <PieChart width={400} height={450}>
              <Pie
                data={categoryData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                label
              >
                {categoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                align="center"
                verticalAlign="bottom"
                layout="vertical"
                iconType="plainline"
                iconSize={15}
              />    
            </PieChart>
          ) : (
            <p style={{ textAlign: "center", fontSize: "16px", color: "gray" }}>
              No hay información disponible.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}