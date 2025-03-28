import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';
import { GiReceiveMoney } from 'react-icons/gi';
import { GiPayMoney } from 'react-icons/gi';
import { GiMoneyStack } from 'react-icons/gi';
import { getPersonalExpensesByUserId } from '../../../services/PersonalExpensesService';
import { getSavingsByUserId } from '../../../services/SavingsService';
import { getDebtsByUserId } from '../../../services/DebtsService';

export default function PersonalBudgetPlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [personalExpenses, setPersonalExpenses] = useState([]);
  const [personalSavings, setPersonalSavings] = useState([]);
  const [personalDebts, setPersonalDebts] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateWindow, setDateWindow] = useState({
    center: new Date(),
    offset: 3
  });

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  const generateMonths = () => {
    const months = [];
    const centerDate = new Date(dateWindow.center);
    const startDate = new Date(centerDate.getFullYear(), centerDate.getMonth() - dateWindow.offset, 1);
    const endDate = new Date(centerDate.getFullYear(), centerDate.getMonth() + dateWindow.offset, 1);

    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
      months.push({
        date: new Date(d),
        label: d.toLocaleString('default', { month: 'long', year: 'numeric' })
      });
    }

    return months;
  };

  const handleMonthSelect = (monthObj) => {
    setSelectedMonth(monthObj.date);
    const months = generateMonths();
    const selectedIndex = months.findIndex(m => isSameMonth(m.date, monthObj.date));
    
    if (selectedIndex === 0 || selectedIndex === months.length - 1) {
      setDateWindow(prev => ({
        center: monthObj.date,
        offset: prev.offset
      }));
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const fetchData = async () => {
        try {
          const [expensesResponse, savingsResponse, debtsResponse] = await Promise.all([
            getPersonalExpensesByUserId(userId),
            getSavingsByUserId(userId),
            getDebtsByUserId(userId)
          ]);
          setPersonalExpenses(expensesResponse || []);
          setPersonalSavings(savingsResponse || []);
          setPersonalDebts(debtsResponse || []);
        } catch (error) {
          console.error('Error fetching data:', error);
          setPersonalExpenses([]);
          setPersonalSavings([]);
          setPersonalDebts([]);
        }
      };
      fetchData();
    }
  }, []);

  useEffect(() => {
    const filteredExpenses = (personalExpenses || []).filter(expense => 
      isSameMonth(new Date(expense.date), selectedMonth)
    );
    const filteredSavings = (personalSavings || []).filter(saving => 
      isSameMonth(new Date(saving.date), selectedMonth)
    );
    const filteredDebts = (personalDebts || []).filter(debt => 
      isSameMonth(new Date(debt.date), selectedMonth)
    );
    setFilteredExpenses(filteredExpenses);
    setFilteredSavings(filteredSavings);
    setFilteredDebts(filteredDebts);
  }, [personalExpenses, personalSavings, personalDebts, selectedMonth]);

  const totalExpenses = (filteredExpenses || []).reduce((sum, expense) => sum + expense.amount, 0);
  const totalSavings = (filteredSavings || []).reduce((sum, saving) => sum + saving.amount, 0);
  const totalDebts = (filteredDebts || []).reduce((sum, debt) => sum + debt.amount, 0);
  const balance = totalSavings - totalExpenses;

  const chartData = [
    { name: 'EXPENSES', value: totalExpenses, color: '#30437A' },
    { name: 'SAVINGS', value: totalSavings, color: '#3DC9A7' }
  ];

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
      marginTop: '150px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      width: '70%',
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
    },
    pieContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    },
    card: (color) => ({
      backgroundColor: color,
      color: 'white',
      width: '200px',
      height: '110px',
      margin: '20px 30px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      boxShadow: color === '#30437A'
        ? '0px 8px 5px rgba(48, 55, 122, 0.2)'
        : color === '#3DC9A7'
        ? '0px 8px 5px rgba(61, 193, 173, 0.2)'
        : color === '#B1B1B1'
        ? '0px 8px 5px rgba(176, 176, 176, 0.2)'
        : 'none',
    }),
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
    navigate(paths[text] || '/personal-budget-planner');
  };
  
  return (
    <div className='container-fluid'>
      <div className="navbar fixed-top bg-body-tertiary">
        <div className="container-fluid">
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
          {generateMonths().map((monthObj, index) => (
            <span
              key={`${monthObj.date.getMonth()}-${monthObj.date.getFullYear()}-${index}`}
              onClick={() => handleMonthSelect(monthObj)}
              style={isSameMonth(monthObj.date, selectedMonth) ?
                { ...styles.dateItem, ...styles.activeDate } :
                styles.dateItem}
            >
              {monthObj.label}
            </span>
          ))}
        </div>

        <Divider style={styles.divider} />
      </div>

      <div style={styles.bodyContainer}>
        <div style={styles.cardContainer}>
          <div style={styles.card('#3DC9A7')}>
            <GiReceiveMoney style={{ fontSize: '40px', marginRight: '15px'}} />
            ${totalSavings.toFixed(2)}
          </div>
          <div style={styles.card('#30437A')}>
            <GiPayMoney style={{ fontSize: '40px', marginRight: '15px'}} />
            -${totalExpenses.toFixed(2)}
          </div>
          <div style={styles.card('#B1B1B1')}>
            <GiMoneyStack style={{ fontSize: '40px', marginRight: '15px'}} />
            -${totalDebts.toFixed(2)}
          </div>
        </div>

        <div style={styles.pieContainer}>
          <h3 style={styles.title}>TOTAL BALANCE</h3>
          <PieChart width={400} height={400}>
            <Pie 
              data={chartData} 
              cx={150} 
              cy={150} 
              innerRadius={80} 
              label 
              outerRadius={120} 
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              align='left' 
              verticalAlign='middle' 
              layout='vertical'
              iconType='plainline'
              iconSize={15}
              wrapperStyle={{ top: 100, left: 500, right: 0, display: 'flex', justifyContent: 'flex-start' }} 
            />
          </PieChart>
        </div>
      </div>
    </div>
  );
}