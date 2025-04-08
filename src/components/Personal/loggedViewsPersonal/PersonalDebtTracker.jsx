import React, { useState, useEffect } from 'react';
import { getDebtsByUserId, createDebt, updateDebt, deleteDebt } from '../../../services/DebtsService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useLocation } from 'react-router-dom';
import { Chip, Divider } from '@mui/material';
import { GiTakeMyMoney } from "react-icons/gi";
import { LiaMoneyCheckAltSolid } from "react-icons/lia";
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { Modal, Box } from '@mui/material';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../MonthSelector';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';

const schema = yup.object().shape({
  creditor: yup.string().required('El acreedor es obligatorio').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  amount: yup
    .number()
    .typeError('La cantidad debe ser un número válido')
    .positive('La cantidad debe ser mayor a 0')
    .test('decimal-precision', 'Máximo 2 decimales', value => /^\d+(\.\d{1,2})?$/.test(value?.toString()))
    .required('La cantidad es obligatoria'),
});

export default function PersonalDebtTracker() {
  const [personalDebts, setPersonalDebts] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [newDebt, setNewDebt] = useState({
    creditor: '',
    amount: '',
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

  const isCurrentMonth = () => {
    const currentMonth = new Date();
    return selectedMonth.getFullYear() === currentMonth.getFullYear() &&
      selectedMonth.getMonth() === currentMonth.getMonth();
  };

  const isDisabled = !isCurrentMonth();

  // Verificar si dos fechas pertenecen al mismo mes
  const isSameMonth = (date1, date2) => {
    return (
      new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
      new Date(date1).getMonth() === new Date(date2).getMonth()
    );
  };

  const customStyles = {
    cells: {
      style: {
        color: '#333', // Texto oscuro
        fontSize: '14px',
      },
    },
    headCells: {
      style: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    },
    paginationRowsPerPage: {
      style: {
        display: 'none',
      },
    },
  };

  const getTranslatedStatus = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'PAID':
        return 'Pagado';
      case 'OVERDUE':
        return 'Atrasado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
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

  const openForm = () => {
    reset();
    setIsOpen(true);
  };
  const closeForm = () => {
    reset();
    setIsOpen(false);
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('No hay usuario autenticado');

      const debtData = {
        ...data,
        userId,
        amount: parseFloat(data.amount),
        date: new Date().toISOString(),
        status: 'PENDING'
      };

      await createDebt(debtData);
      console.log('Deuda creada exitosamente');

      // Recargar las deudas
      const response = await getDebtsByUserId(userId);
      setPersonalDebts(response);
      setFilteredDebts(response.filter(debt => isSameMonth(debt.date, selectedMonth)));

      // Limpiar el formulario y cerrar el modal
      setValue('creditor', '');
      setValue('amount', '');
      closeForm();
    } catch (error) {
      setErrorMessage(error.message || 'Error al crear la deuda');
    } finally {
      setIsLoading(false);
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

  // Calcular el total de deudas del mes
  const calculateTotal = () => {
    return personalDebts
      .filter(debt => debt.status !== 'PAID')  // Exclude paid debts from the total
      .reduce((sum, debt) => sum + debt.amount, 0);
  };

  // Definir las columnas
  const columns = [
    {
      selector: row => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon />
        </div>
      ),
      minWidth: '60px',
      maxWidth: '80px',
    },
    {
      name: 'Acreedor',
      selector: row => row.creditor,
      grow: 0.3,
      minWidth: '100px',
    },
    {
      name: 'Monto',
      selector: row => `$${row.amount.toFixed(2)}`,
      grow: 0.2,
      minWidth: '100px',
    },
    {
      name: 'Fecha de registro',
      selector: row => new Date(row.date).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      grow: 0.3,
      minWidth: '120px',
    },
    {
      name: 'Estado',
      selector: row => (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <Chip
            label={getTranslatedStatus(row.status)} // 👈 usa aquí la traducción
            style={{
              backgroundColor: getStatusColor(row.status),
              color: 'white',
            }}
          />
          {row.status === 'PENDING' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'PAID')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3DC9A7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Marcar como pagada
            </button>
          )}
        </div>
      ),
      grow: 0.5,
      minWidth: '150px',
    },
  ];

  filteredDebts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const conditionalRowStyles = [
    {
      when: row => row.status === 'PAID',
      style: {
        backgroundColor: '#f0f0f0',
        cursor: 'not-allowed',
      },
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
      boxShadow: '0px 8px 5px rgba(136, 136, 136, 0.2)',
    },
    button: {
      alignSelf: 'flex-end',
      margin: '15px',
      fontSize: '35px',
      color: '#B1B1B1',
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
      marginTop: '10px',
      color: 'white',
    },
    addButton: {
      border: '1px solid #B1B1B1',
      backgroundColor: 'white',
      width: '200px',
      height: '140px',
      margin: '20px 30px',
      borderRadius: '8px',
      display: 'flex',
      padding: '10px',
      flexDirection: 'column',
      fontSize: '20px',
      color: 'black',
      boxShadow: '0px 8px 5px rgba(136, 136, 136, 0.2)',
      opacity: isDisabled ? 0.6 : 1,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
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
      color: '#B1B1B1',
    },
  };

  return (
    <div>
      <div className="row justify-content-center">
        <TopNavBar />
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
          dateWindow={dateWindow}
          setDateWindow={setDateWindow}
        />
        <Divider style={styles.divider} />
      </div>

      <div className='row mt-3'>
        <div className='col-sm-3 d-flex flex-column justify-content-center align-items-center'>
          <div style={styles.card}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
              <text>DEUDAS</text>
              <GiTakeMyMoney style={{ fontSize: '220%' }} />
            </div>
            <text style={styles.cardText}>${calculateTotal().toFixed(2)}</text>
            <text style={styles.cardSubtitle}>Deudas del mes</text>
          </div>
          <button
            style={styles.addButton}
            onClick={() => !isDisabled && openForm()}
            disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>NUEVA DEUDA</text>
          </button>
        </div>

        <div className='col-9 flex-column justify-content-center align-items-center' style={{ overflowX: 'auto', paddingHorizontal: '20px', boxSizing: 'border-box' }}>
          <DataTable
            columns={columns}
            data={filteredDebts}
            pagination
            conditionalRowStyles={conditionalRowStyles}
            noDataComponent="No hay deudas disponibles."
            customStyles={customStyles}
          />
        </div>
      </div>

      <Modal open={open} onClose={closeForm}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '20px' }}>
              <p style={styles.title}>Nueva deuda</p>
            </div>
            {errorMessage && (
              <div style={{
                backgroundColor: '#ffebee',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                color: '#d32f2f',
              }}>
                {errorMessage}
              </div>
            )}

            <div>
              <input
                className="input col-12"
                placeholder="Acreedor"
                type="text"
                {...register('creditor')}
              />
              {errors.creditor && <p style={{ color: 'red' }}>{errors.creditor.message}</p>}
            </div>

            <div>
              <input
                className="input col-12"
                step={0.01}
                placeholder="Cantidad"
                type="number"
                {...register('amount')}
              />
              {errors.amount && <p style={{ color: 'red' }}>{errors.amount.message}</p>}
            </div>

            <Divider style={styles.divider} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                className="primary_button"
                style={{ width: '40%' }}
                type="button"
                onClick={closeForm}
              >
                Cancelar
              </button>
              <button
                className="secondary_button"
                style={{ width: '40%' }}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'PROCESANDO...' : 'Agregar'}
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
