import React, { useState, useEffect } from 'react';
import { getPersonalExpensesByUserId } from '../../../services/PersonalExpensesService';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';
import logo from '../../../assets/logo.png';
import { useLocation } from 'react-router-dom';

export default function PersonalGraphics() {
  const [personalExpenses, setPersonalExpenses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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
          return;
        }

        const fetchedExpenses = response.map(expense => ({
          ...expense,
          categoryName: expense.categoryName || 'Sin categoría',
        }));

        setPersonalExpenses(fetchedExpenses);
      } catch (error) {
        console.error('Error al obtener los gastos personales:', error);
      }
    };

    fetchPersonalExpenses();
  }, [navigate]);


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

  // Preparar los datos para el gráfico de pastel
  const categoryData = () => {
    const categoryCounts = personalExpenses.reduce((acc, expense) => {
      const categoryName = expense.categoryName || 'Sin categoría';
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {});
  
    return Object.keys(categoryCounts).map(categoryName => {
      const color = categoryColors[categoryName] || '#808080'; // Default color if category is not found
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

        <div style={styles.datePicker}>
          {['December 2024', 'January 2025', 'February 2025', 'March 2025', 'April 2025'].map((month, index) => (
            <span key={index} style={index === 1 ? { ...styles.dateItem, ...styles.activeDate } : styles.dateItem}>
              {month}
            </span>
          ))}
        </div>

        <Divider style={styles.divider} />
      </div>

      <div style={styles.bodyContainer}>
      <div style={styles.pieContainer}>
          <text style={styles.expensesTitle}>DEBTS VS SAVINGS</text>
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
            <Legend align='left' 
              verticalAlign='middle' 
              layout='vertical'
              iconType='plainline'
              iconSize={15}
              wrapperStyle={{ top: 100, left: 430, right: 0, display: 'flex', justifyContent: 'flex-start' }} />    
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
            <Legend align='left' 
              verticalAlign='middle' 
              layout='vertical'
              iconType='plainline'
              iconSize={15}
              wrapperStyle={{ top: 100, left: 430, right: 0, display: 'flex', justifyContent: 'flex-start' }} />    
          </PieChart>
        </div>
      </div>
      <button className='primary_button' style={styles.button}>GENERATE REPORT</button>
    </div>
  );
}