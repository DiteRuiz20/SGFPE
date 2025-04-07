import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { BsDoorOpen } from 'react-icons/bs';
import { useAuth } from '../../../context/AuthContext';
import { Modal, Box, Divider } from '@mui/material';

export default function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, logout } = useAuth();
  const [openLO, setIsOpenLO] = React.useState(false);
  const openLogOutForm = () => setIsOpenLO(true);
  const closeLogOutForm = () => setIsOpenLO(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    { path: '/personal-budget-planner', label: 'PRESUPUESTO' },
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
    modalStyle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 600,
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '8px',
    },
    titleLO: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#dd1e1e',
      marginBottom: 20,
    },
    divider: {
      width: '100%',
      height: '2px',
      backgroundColor: '#999',
      marginTop: 20,
      marginBottom: 20,
    },
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
      <button className="btn btn-outline-danger" type="button" onClick={openLogOutForm}>
        <BsDoorOpen style={{ fontSize: '150%' }} />
      </button>

      {/* Modal */}
      <Modal open={openLO} onClose={closeLogOutForm}>
          <Box sx={styles.modalStyle}>
            <form onSubmit={handleLogout}>
              <div style={{ marginBottom: '20px' }}>
                <text style={styles.titleLO}>Cerrar Sesión</text>
              </div>
              <Divider style={styles.divider} />
              <p style={{textAlign: 'center', fontSize: '20px'}}>¿Estás seguro de que deseas cerrar tu sesión?</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button className='primary_button' style={{ width: '40%', marginRight: '10px' }} type="button" onClick={closeLogOutForm}>Cancelar</button>
                <button className='logOut_button' style={{ width: '40%' }} type="submit">Cerrar Sesión</button>
              </div>
            </form>
          </Box>
        </Modal>
    </nav>
  );
}