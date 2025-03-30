import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';

export default function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: '/personal-budget-planner', label: 'PRESUPUESTOS' },
    { path: '/personal-debt-tracker', label: 'DEUDAS' },
    { path: '/personal-saving-tracker', label: 'AHORROS' },
    { path: '/personal-expenses', label: 'GASTOS' },
    { path: '/personal-graphics', label: 'GRÁFICOS' },
    { path: '/personal-profile', label: 'PERFIL' },
  ];

  const styles = {
    navLink: (path) => ({
      cursor: 'pointer',
      padding: '10px 25px',
      fontSize: '16px',
      color: location.pathname === path ? '#000' : '#888',
      borderBottom: location.pathname === path ? '4px solid #30437A' : '1px solid transparent',
      transition: 'border-color 0.3s',
    }),
  };

  return (
    <div className='d-flex justify-content-between align-items-center mb-3' style={{ width: '80%' }}>
      <img src={logo} alt='Logo' style={{ width: '90px', marginRight: '20px' }} />
      {links.map((link) => (
        <span key={link.path} style={styles.navLink(link.path)} onClick={() => navigate(link.path)}>
          {link.label}
        </span>
      ))}
    </div>
  );
}