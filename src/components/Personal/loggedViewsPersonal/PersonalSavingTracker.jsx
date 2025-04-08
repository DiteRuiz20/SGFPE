import React, { useState, useEffect } from 'react';
import { getSavingsByUserId, createSaving } from '../../../services/SavingsService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useLocation } from 'react-router-dom';
import { Divider } from '@mui/material';
import { GiReceiveMoney } from "react-icons/gi";
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { Modal, Box } from '@mui/material';
import { TbPigMoney } from "react-icons/tb";
import TopNavBar from './TopNavBar';
import MonthSelector from '../../MonthSelector';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';

const schema = yup.object().shape({
  description: yup.string().required('La descripción es obligatoria').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  amount: yup
    .number()
    .typeError('La cantidad debe ser un número válido')
    .positive('La cantidad debe ser mayor a 0')
    .test('decimal-precision', 'Máximo 2 decimales', value => /^\d+(\.\d{1,2})?$/.test(value?.toString()))
    .required('La cantidad es obligatoria'),
});

export default function PersonalSavingTracker() {
  const [personalSavings, setPersonalSavings] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [newSaving, setNewSaving] = useState({
    description: '',
    amount: '',
  });
  const [open, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Configuración para el selector de fechas
  const [dateWindow, setDateWindow] = useState({
    center: new Date(),
    offset: 3,
  });

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

  // Función para generar los meses en el selector
  const generateMonths = () => {
    const { center, range } = dateWindow;
    const months = [];

    for (let i = -range; i <= range; i++) {
      const year = center.getFullYear();
      const month = center.getMonth() + i;
      const date = new Date(year, month, 1); // <== esta forma evita mutaciones inesperadas

      months.push({
        label: `${date.toLocaleString('es-MX', { month: 'long' })} ${date.getFullYear()}`,
        date,
        isStart: i === -range,
        isEnd: i === range,
      });
    }

    return months;
  };

  // Filtrar los ahorros por el mes seleccionado
  useEffect(() => {
    if (personalSavings.length > 0) {
      const filtered = personalSavings.filter(saving =>
        isSameMonth(saving.date, selectedMonth)
      );
      setFilteredSavings(filtered);
    }
  }, [personalSavings, selectedMonth]);

  // Cargar los ahorros
  useEffect(() => {
    const fetchPersonalSavings = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login-personal');
        return;
      }

      try {
        const response = await getSavingsByUserId(userId);
        console.log('Ahorros personales obtenidos:', response);

        if (!response || !Array.isArray(response)) {
          console.warn('No hay ahorros registrados para este usuario.');
          setPersonalSavings([]);
          setFilteredSavings([]);
          return;
        }

        setPersonalSavings(response);
        setFilteredSavings(response.filter(saving =>
          isSameMonth(saving.date, selectedMonth)
        ));
      } catch (error) {
        console.error('Error al obtener los ahorros personales:', error);
      }
    };

    fetchPersonalSavings();
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
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('No hay usuario autenticado');

      const savingData = {
        ...newSaving,
        userId: userId,
        description: data.description,
        amount: parseFloat(data.amount),
        date: new Date().toISOString(),
      };

      await createSaving(savingData);

      // Recargar los ahorros después de crear uno nuevo
      const response = await getSavingsByUserId(userId);
      setPersonalSavings(response);
      setFilteredSavings(response);

      // Limpiar el formulario y cerrar el modal
      setNewSaving({
        description: '',
        amount: '',
      });
      closeForm();
    } catch (error) {
      console.error('Error al crear el ahorro:', error);
    }
  };

  filteredSavings.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calcular el total de ahorros del mes
  const totalSavings = filteredSavings.reduce((sum, saving) => sum + saving.amount, 0);

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
      name: 'Descripción',
      selector: row => row.description,
      grow: 0.4,
      minWidth: '100px',
    },
    {
      name: 'Cantidad',
      selector: row => `$${row.amount.toFixed(2)}`,
      grow: 0.3,
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
      minWidth: '100px',
    },
  ];

  const CategoryIcon = () => {
    const icon = <TbPigMoney />;
    const color = '#3DC9A7';

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
      backgroundColor: '#3DC9A7',
      color: 'white',
      width: '200px',
      height: '140px',
      margin: '20px 30px',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '20px',
      boxShadow: '0px 8px 5px rgba(61, 193, 173, 0.2)'
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
    button: {
      alignSelf: 'flex-end',
      margin: '10px',
      fontSize: '35px',
      color: '#3DC9A7',
    },
    addButton: {
      border: '1px solid #3DC9A7',
      backgroundColor: 'white',
      width: '200px',
      height: '140px',
      margin: '20px 30px',
      padding: '10px',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '20px',
      color: 'black',
      boxShadow: '0px 8px 5px rgba(61, 193, 173, 0.2)',
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
      color: '#3DC9A7',
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
              <text>AHORROS</text>
              <GiReceiveMoney style={{ fontSize: '220%' }} />
            </div>
            <text style={styles.cardText}>${totalSavings.toFixed(2)}</text>
            <text style={styles.cardSubtitle}>Ahorros del mes</text>
          </div>

          <button
            style={styles.addButton}
            onClick={() => !isDisabled && openForm()}
            disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>NUEVO AHORRO</text>
          </button>
        </div>

        <div className='col-sm-8 flex-column justify-content-center align-items-center'>
          <DataTable
            columns={columns}
            data={filteredSavings}
            pagination
            noDataComponent="No hay ahorros disponibles."
            customStyles={customStyles}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={closeForm}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '20px' }}>
              <text style={styles.title}>Nuevo ahorro</text>
            </div>
            <div>
              <input className='input col-12'
                placeholder='Descripción'
                type="text"
                {...register('description')}
              />
              {errors.description && <p style={{ color: 'red' }}>{errors.description.message}</p>}
            </div>
            <div>
              <input className='input col-12'
                placeholder='Cantidad'
                step={0.01}
                type="number"
                {...register('amount')}
              />
              {errors.amount && <p style={{ color: 'red' }}>{errors.amount.message}</p>}
            </div>
            <Divider style={styles.divider} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button className='primary_button' style={{ width: '40%', marginRight: '10px' }} type="button" onClick={closeForm}>Cancelar</button>
              <button className='secondary_button' style={{ width: '40%' }} type="submit">Agregar</button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
