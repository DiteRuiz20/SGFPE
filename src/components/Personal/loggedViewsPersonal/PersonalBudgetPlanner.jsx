import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider, Tooltip } from '@mui/material';
import { GiReceiveMoney, GiTakeMyMoney } from 'react-icons/gi';
import { GiPayMoney } from 'react-icons/gi';
import { GiMoneyStack } from 'react-icons/gi';
import { getPersonalExpensesByUserId } from '../../../services/PersonalExpensesService';
import { getSavingsByUserId } from '../../../services/SavingsService';
import { getDebtsByUserId } from '../../../services/DebtsService';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../MonthSelector';

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
    offset: 3, // Mostrará 5 meses (2 antes, 2 después, y el actual)
  });

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
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
  const calculateTotal = () => {
    return personalDebts
      .filter(debt => debt.status !== 'PAID')
      .reduce((sum, debt) => sum + debt.amount, 0);
  };
  const totalBalance = totalSavings - totalExpenses;

  const chartData = () => {
    if (totalSavings === 0 && totalExpenses === 0) return [];
    return [
      { name: 'AHORROS', value: totalSavings, color: '#3DC9A7' },
      { name: 'GASTOS', value: totalExpenses, color: '#30437A' }
    ];
  };

  const styles = {
    divider: {
      width: '100%',
      height: '2px',
      backgroundColor: '#999',
      marginTop: 20,
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
      textAlign: 'center',
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
        <div className="row col-sm-6 row-cols-1 row-cols-md-1 row-cols-lg-2 g-2">
          <div className="col d-flex justify-content-center">
            <Tooltip title="Total de ahorros" arrow placement="bottom">
              <div style={styles.card('#3DC9A7')}>
                <GiReceiveMoney style={{ fontSize: '220%', marginRight: '15px' }} />
                ${totalSavings.toFixed(2)}
              </div>
            </Tooltip>
          </div>

          <div className="col d-flex justify-content-center">
            <Tooltip title="Total de gastos" arrow placement="bottom">
              <div style={styles.card('#30437A')}>
                <GiPayMoney style={{ fontSize: '220%', marginRight: '15px' }} />
                ${totalExpenses.toFixed(2)}
              </div>
            </Tooltip>
          </div>

          <div className="col d-flex justify-content-center">
            <Tooltip title="Fondos restantes" arrow placement="bottom">
              <div style={styles.card('#3DC9A7')}>
                <GiMoneyStack style={{ fontSize: '220%', marginRight: '15px' }} />
                {totalBalance.toFixed(2)}
              </div>
            </Tooltip>
          </div>

          <div className="col d-flex justify-content-center">
            <Tooltip title="Total de deudas" arrow placement="bottom">
              <div style={styles.card('#B1B1B1')}>
                <GiTakeMyMoney style={{ fontSize: '220%', marginRight: '15px' }} />
                ${calculateTotal().toFixed(2)}
              </div>
            </Tooltip>
          </div>
        </div>

        <div className='col-sm-6 d-flex flex-column justify-content-center align-items-center'>
          <h3 style={styles.title}>PRESUPUESTO TOTAL</h3>
          {chartData().length > 0 ? (
            <PieChart width={400} height={450} margin={{bottom: 50 }}>
              <Pie
                data={chartData()} 
                cx={200} 
                cy={200} 
                innerRadius={80} 
                label 
                outerRadius={120} 
                dataKey="value"
              >
                {chartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                align="center"
                verticalAlign="bottom"
                layout="horizontal"
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