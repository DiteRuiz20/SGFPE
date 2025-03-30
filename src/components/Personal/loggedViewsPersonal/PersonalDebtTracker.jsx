import React, { useState, useEffect } from 'react';
import { getDebtsByUserId, createDebt, updateDebt, deleteDebt } from '../../../services/DebtsService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { Divider } from '@mui/material';
import { GiTakeMyMoney } from "react-icons/gi";
import { LiaMoneyCheckAltSolid } from "react-icons/lia";
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { Modal, Box } from '@mui/material';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../MonthSelector';
import { FaUserCircle, FaMoneyBillWave, FaCalendarAlt, FaCalendarCheck, FaCheck, FaExclamationTriangle, FaTimes, FaQuestion, FaTrash } from 'react-icons/fa';

export default function PersonalDebtTracker() {
  const [personalDebts, setPersonalDebts] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [newDebt, setNewDebt] = useState({
    creditor: '',
    amount: '',
    dueDate: '',
    status: 'PENDING'
  });
  const [open, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Configuración para el selector de fechas
  const [dateWindow, setDateWindow] = useState({
    center: new Date(),
    offset: 3,
  });

  // Verificar si dos fechas pertenecen al mismo mes
  const isSameMonth = (date1, date2) => {
    return (
      new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
      new Date(date1).getMonth() === new Date(date2).getMonth()
    );
  };

    // Filtrar las deudas por el mes seleccionado
    useEffect(() => {
        if (personalDebts.length > 0) {
            const filtered = personalDebts.filter(debt =>
                isSameMonth(debt.date, selectedMonth)
            );
            setFilteredDebts(filtered);
        }
    }, [personalDebts, selectedMonth]);

  // Cargar las deudas
  useEffect(() => {
    const fetchPersonalDebts = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login-personal');
        return;
      }

      try {
        const response = await getDebtsByUserId(userId);
        console.log('Deudas personales obtenidas:', response);

        if (!response || !Array.isArray(response)) {
          console.warn('No hay deudas registradas para este usuario.');
          setPersonalDebts([]);
          setFilteredDebts([]);
          return;
        }

        setPersonalDebts(response);
        setFilteredDebts(response.filter(debt =>
          isSameMonth(debt.date, selectedMonth)
        ));
      } catch (error) {
        console.error('Error al obtener las deudas personales:', error);
      }
    };

    fetchPersonalDebts();
  }, [navigate]);

  const openForm = () => setIsOpen(true);
  const closeForm = () => setIsOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDebt(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    if (!userId) {
      console.error('No hay usuario autenticado');
      return;
    }

    try {
      const debtData = {
        ...newDebt,
        userId: userId,
        amount: parseFloat(newDebt.amount),
        date: new Date().toISOString(),
        status: 'PENDING'
      };

      await createDebt(debtData);
      console.log('Deuda creada exitosamente');

      // Recargar las deudas
      const response = await getDebtsByUserId(userId);
      setPersonalDebts(response);
      setFilteredDebts(response.filter(debt =>
        isSameMonth(debt.date, selectedMonth)
      ));

      // Limpiar el formulario y cerrar el modal
      setNewDebt({
        creditor: '',
        amount: '',
        dueDate: '',
        status: 'PENDING'
      });
      closeForm();
    } catch (error) {
      console.error('Error al crear la deuda:', error);
    }
  };

  const handleStatusUpdate = async (debtId, newStatus) => {
    try {
      const debt = personalDebts.find(d => d.id === debtId);
      if (!debt) return;

      await updateDebt(debtId, { ...debt, status: newStatus });

      // Recargar las deudas
      const userId = localStorage.getItem('userId');
      const response = await getDebtsByUserId(userId);
      setPersonalDebts(response);
      setFilteredDebts(response.filter(d =>
        isSameMonth(d.date, selectedMonth)
      ));
    } catch (error) {
      console.error('Error al actualizar el estado de la deuda:', error);
    }
  };

  const handleDeleteDebt = async (debtId) => {
    try {
      await deleteDebt(debtId);

      // Recargar las deudas
      const userId = localStorage.getItem('userId');
      const response = await getDebtsByUserId(userId);
      setPersonalDebts(response);
      setFilteredDebts(response.filter(debt =>
        isSameMonth(debt.date, selectedMonth)
      ));
    } catch (error) {
      console.error('Error al eliminar la deuda:', error);
    }
  };

  // Calcular el total de deudas del mes
  const totalDebts = filteredDebts.reduce((sum, debt) => sum + debt.amount, 0);

  // Definir las columnas
  const columns = [
    {
      selector: row => (
        <div style={{ display: 'flex', alignItems: 'left' }}>
          <CategoryIcon />
        </div>
      ),
      grow: 0.05,
      wrap: true,
      minWidth: '10px',
    },
    {
      selector: row => row.creditor,
      grow: 0.2,
      wrap: true,
      minWidth: '20px',
    },
    {
      selector: row => `$${row.amount.toFixed(2)}`,
      grow: 0.15,
      wrap: true,
      minWidth: '80px',
    },
    {
      selector: row => new Date(row.date).toLocaleDateString(),
      grow: 0.15,
      wrap: true,
      minWidth: '80px',
    },
    {
      selector: row => new Date(row.dueDate).toLocaleDateString(),
      grow: 0.15,
      wrap: true,
      minWidth: '80px',
    },
    {
      selector: row => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: getStatusColor(row.status),
            color: 'white'
          }}>
            {row.status}
          </span>
          {row.status !== 'PENDING' && (
            <button
              onClick={() => handleDeleteDebt(row.id)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Eliminar
            </button>
          )}
          {row.status === 'PENDING' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'PAID')}
              style={{
                padding: '4px 8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Marcar como Pagada
            </button>
          )}
          {row.status === 'PENDING' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'CANCELLED')}
              style={{
                padding: '4px 8px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      ),
      grow: 0.3,
      right: true,
      wrap: true,
      minWidth: '200px',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#ff9800';
      case 'PAID':
        return '#4CAF50';
      case 'OVERDUE':
        return '#f44336';
      case 'CANCELLED':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  const CategoryIcon = () => {
    const icon = <LiaMoneyCheckAltSolid />;
    const color = '#B1B1B1';

    return (
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '18px', color: 'white' }}>
          {icon}
        </span>
      </div>
    );
  };

    const styles = {
        divider: {
          width: '100%',
          height: '2px',
          backgroundColor: '#999',
          marginTop: 20,
        },
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
        card: {
          backgroundColor: '#B1B1B1',
          color: 'white',
          width: '200px',
          height: '140px',
          margin: '20px 30px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '20px',
          boxShadow:'0px 8px 5px rgba(48, 67, 122, 0.2)'
        },
        cardText: {
          fontSize: '20px',
          alignSelf: 'center',
          marginTop: '-10px',
          fontWeight: 'bold',
        },
        cardSubtitle: {
          fontSize: '16px',
          alignSelf: 'center',
          color: 'white',
        },
        button: {
          alignSelf: 'flex-end',
          margin: '15px',
          fontSize: '35px',
            color: '#30437A',
        },
        addButton: {
          cursor: 'pointer',
          border: '1px solid #B1B1B1',
          width: '200px',
          height: '140px',
          margin: '20px 30px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '20px',
          color: 'black',
            boxShadow:'0px 8px 5px rgba(48, 67, 122, 0.2)'
        },
        modalStyle: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '8px',
        },
        title: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#30437A',
        },
      };

  const customStyles = {
    headCells: {
      style: {
        height: '0px',
        padding: '0px',
        border: 'none',
        visibility: 'hidden',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        padding: '10px',
        display: 'flex',
      },
    },
    rows: {
      style: {
        '&:hover': {
          backgroundColor: '#e3e3e3',
        },
      },
    },
    table: {
      style: {
        width: '100%',
      },
    },
  };

    return (
      <div>
          <div className="row justify-content-center mt-3 mb-5">
            <TopNavBar/>
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
              dateWindow={dateWindow}
              setDateWindow={setDateWindow}
            />
            <Divider style={styles.divider} />
          </div>

          <div className='row mt-5'>
          <div className='col-sm-6 d-flex flex-column justify-content-center align-items-center'>
            <div style={styles.card}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
                <p>DEUDAS</p>
                <GiTakeMyMoney style={{ fontSize: '40px'}} />
                </div>
                  <p style={styles.cardText}>-${totalDebts.toFixed(2)}</p>
                  <p style={styles.cardSubtitle}>Deudas del mes</p>
            </div>
            <div style={{...styles.addButton, border: '1px solid #B1B1B1'}} onClick={openForm}>
              <MdOutlineAddToPhotos style={{...styles.button, color: '#B1B1B1'}} />
            <p style={{alignSelf: 'center'}}>NUEVA DEUDA</p>
            </div>
          </div>

          <div className='col-sm-6 flex-column justify-content-center align-items-center'>
            <DataTable
              columns={columns}
              data={filteredDebts}
              customStyles={customStyles}
              pagination
            />
            </div>
          </div>

      <Modal open={open} onClose={closeForm}>
        <Box sx={styles.modalStyle}>
            <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '20px'}}>
                <text style={styles.title}>Nueva deuda</text>
            </div>
            <div>
                <input className='input col-12'
                placeholder='Acreedor'
                type="text"
                name="creditor"
                value={newDebt.creditor}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
                <input className='input col-12'
                placeholder='Cantidad'
                type="number"
                name="amount"
                value={newDebt.amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
                <input className='input col-12'
                type="date"
                name="dueDate"
                value={newDebt.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <Divider style={styles.divider} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button className='primary_button' style={{ width: '40%'}} type="button" onClick={closeForm}>Cancelar</button>
              <button className='secondary_button' style={{ width: '40%' }} type="submit">Agregar</button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
