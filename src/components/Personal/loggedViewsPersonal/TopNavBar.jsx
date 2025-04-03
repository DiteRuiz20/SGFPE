import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { BsDoorOpen } from 'react-icons/bs';
import { useAuth } from '../../../context/AuthContext';

export default function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
      padding: '10px 20px',
      fontSize: '16px',
      color: location.pathname === path ? '#000' : '#888',
      borderBottom: location.pathname === path ? '4px solid #30437A' : '1px solid transparent',
      transition: 'border-color 0.3s',
    }),
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white px-5">
      <a className="navbar-brand">
        <img src={logo} alt="Logo" style={{ width: '90px' }} />
      </a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse justify-content-around" id="navbarNav">
        {links.map((link) => (
          <span
            key={link.path}
            className="nav-link"
            style={styles.navLink(link.path)}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </span>
        ))}
      </div>
      <button className="btn btn-outline-danger" type="button" onClick={handleLogout}>
        <BsDoorOpen style={{ fontSize: '150%' }} />
      </button>
    </nav>
  );
}