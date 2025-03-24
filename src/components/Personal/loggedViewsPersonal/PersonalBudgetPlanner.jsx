import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';
import { GiReceiveMoney } from 'react-icons/gi';
import { GiPayMoney } from 'react-icons/gi';
import { GiMoneyStack } from 'react-icons/gi';

const data = [
  { name: 'EXPENSES', value: 15000, color: '#30437A' },
  { name: 'INCOME', value: 50000, color: '#3DC9A7' },
];

export default function PersonalBudgetPlanner() {
  const navigate = useNavigate();
  const location = useLocation();

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
        <div style={styles.cardContainer}>
          <div style={styles.card('#3DC9A7')}>
            <GiReceiveMoney style={{ fontSize: '40px', marginRight: '15px'}} />
            $50,000
            </div>
          <div style={styles.card('#30437A')}>
            <GiPayMoney style={{ fontSize: '40px', marginRight: '15px'}} />
            $-15,000
          </div>
          <div style={styles.card('#B1B1B1')}>
            <GiMoneyStack style={{ fontSize: '40px', marginRight: '15px'}} />
            $35,000
          </div>
        </div>

        <div style={styles.pieContainer}>
          <h3 style={styles.title}>TOTAL BALANCE</h3>
          <PieChart width={400} height={400}>
            <Pie data={data} cx={150} cy={150} innerRadius={80} label outerRadius={120} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend align='left' 
                verticalAlign='middle' 
                layout='vertical'
                iconType='plainline'
                iconSize={15}
                wrapperStyle={{ top: 100, left: 500, right: 0, display: 'flex', justifyContent: 'flex-start' }} />
          </PieChart>
        </div>
      </div>
    </div>
  );
}