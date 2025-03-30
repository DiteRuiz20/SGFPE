import React, { useState, useEffect } from 'react';
import { getPersonalExpensesByUserId } from '../../../services/PersonalExpensesService';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';
import logo from '../../../assets/logo.png';
import { Chart as ChartJS, ArcElement, Tooltip, Legend as ChartJSLegend } from 'chart.js';
import { getSavingsByUserId } from '../../../services/SavingsService';
import { getDebtsByUserId } from '../../../services/DebtsService';
import MonthSelector from '../../MonthSelector';

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
    const selectedMonthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const selectedMonthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    const totalDebts = personalDebts
      .filter(debt => {
        const debtDate = new Date(debt.date);
        return debtDate >= selectedMonthStart && debtDate <= selectedMonthEnd;
      })
      .reduce((sum, debt) => sum + debt.amount, 0);

    const totalSavings = personalSavings
      .filter(saving => {
        const savingDate = new Date(saving.date);
        return savingDate >= selectedMonthStart && savingDate <= selectedMonthEnd;
      })
      .reduce((sum, saving) => sum + saving.amount, 0);

    return [
      { name: 'Debts', value: totalDebts, color: 'rgb(177, 177, 177)' },
      { name: 'Savings', value: totalSavings, color: 'rgb(61, 201, 167)' }
    ];
  };

  const categoryColors = {
    Food: '#ff6347',
    Clothes: '#4682b4',
    Transport: '#32cd32',
    Home: '#ff8c00',
    Entertainment: '#8a2be2',
    Health: '#3cb371',
    Education: '#f4a300',
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
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      width: '100vw',
      height: '100vh',
    },
    bodyContainer: {
      marginLeft: '-160px',
      marginTop: '170px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      width: '90%',
    },
    divider: {
      width: '100%',
      height: 2,
      backgroundColor: '#EAEAEA',
      marginTop: 20,
    },
    menu: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '80%',
      marginBottom: '30px'
    },
    header: {
      position: 'fixed',
      marginTop: '30px',
      top: 0,
      display: 'flex',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      width: '100vw',
    },
    navLink: (path) => ({
      cursor: 'pointer',
      padding: '10px 20px',
      fontSize: '16px',
      color: location.pathname === path ? '#000' : '#888',
      borderBottom: location.pathname === path ? '4px solid #30437A' : '2px solid transparent',
      transition: 'border-color 0.3s',
    }),
    datePicker: {
      alignSelf: 'center',
      display: 'flex',
      justifyContent: 'center',
    },
    dateItem: {
      margin: '0 25px',
      color: '#B0B0B0',
      cursor: 'pointer',
    },
    activeDate: {
      color: '#000',
      borderBottom: '2px solid #4AD8C2',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#30437A',
      marginBottom: 20,
    },
    cardContainer: {
      flexDirection: 'column',
      justifyContent: 'left',
      alignItems: 'left',
    },
    pieContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    },
    expensesTitle: {
      marginLeft: '160px',
      fontSize: 28,
      fontWeight: 'bold',
      color: '#30437A',
    },
    button: {
      marginTop: '-30px',
      marginBottom: '-40px',
      marginRight: '30px',
      alignSelf: 'flex-end',
      width: '20%',
      cursor: 'pointer',
      zIndex:10
    },
  };

  const paths = {
    'BUDGET PLANNING': '/personal-budget-planner',
    'DEBT TRACKER': '/personal-debt-tracker',
    'SAVINGS TRACKER': '/personal-saving-tracker',
    'EXPENSE TRACKER': '/personal-expenses',
    'GRAPHICS': '/personal-graphics',
    'PROFILE': '/personal-profile',
  };
  
  const handleNavigation = (text) => {
    navigate(paths[text] || '/personal-graphics');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.menu}>
          <img src={logo} alt="Logo" style={{ width: '90px' }} />
          {['BUDGET PLANNING', 'DEBT TRACKER', 'SAVINGS TRACKER', 'EXPENSE TRACKER', 'GRAPHICS', 'PROFILE'].map((text, index) => (
            <span
              key={index}
              style={styles.navLink(paths[text])}
              onClick={() => handleNavigation(text)}
            >
              {text}
            </span>
          ))}

        </div>

        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
          dateWindow={dateWindow}
          setDateWindow={setDateWindow}
        />

        <Divider style={styles.divider} />
      </div>

      <div style={styles.bodyContainer}>
        <div style={styles.pieContainer}>
          <text style={styles.expensesTitle}>DEBTS VS SAVINGS</text>
          <PieChart width={400} height={400}>
            <Pie
              data={calculateTotals()}
              dataKey="value"
              nameKey="name"
              cx={200}
              cy={200}
              innerRadius={80}
              outerRadius={120}
              label
            >
              {calculateTotals().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              align='left' 
              verticalAlign='middle' 
              layout='vertical'
              iconType='plainline'
              iconSize={15}
              wrapperStyle={{ top: 100, left: 430, right: 0, display: 'flex', justifyContent: 'flex-start' }} 
            />    
          </PieChart>
        </div>

        <div style={styles.pieContainer}>
          <text style={styles.expensesTitle}>EXPENSES</text>
          <PieChart width={400} height={400}>
            <Pie
              data={categoryData()}
              dataKey="value"
              nameKey="name"
              cx={200}
              cy={200}
              innerRadius={80}
              outerRadius={120}
              label
            >
              {categoryData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              align='left' 
              verticalAlign='middle' 
              layout='vertical'
              iconType='plainline'
              iconSize={15}
              wrapperStyle={{ top: 100, left: 430, right: 0, display: 'flex', justifyContent: 'flex-start' }} 
            />    
          </PieChart>
        </div>
      </div>
      <button className='primary_button' style={styles.button}>GENERATE REPORT</button>
    </div>
  );
}