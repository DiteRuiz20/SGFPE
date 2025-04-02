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

    // Generar los meses visibles
    const months = generateMonths();

    // Manejar la selección de un mes
    const handleMonthSelect = (monthObj) => {
        setSelectedMonth(monthObj.date);
        
        if (monthObj.isStart) {
            const newCenter = new Date(dateWindow.center);
            newCenter.setMonth(newCenter.getMonth() - 3);
            setDateWindow(prev => ({
                ...prev,
                center: newCenter
            }));
        } else if (monthObj.isEnd) {
            const newCenter = new Date(dateWindow.center);
            newCenter.setMonth(newCenter.getMonth() + 3);
            setDateWindow(prev => ({
                ...prev,
                center: newCenter
            }));
        }
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

    const openForm = () => setIsOpen(true);
    const closeForm = () => setIsOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSaving(prev => ({
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
            const savingData = {
                ...newSaving,
                userId: userId,
                amount: parseFloat(newSaving.amount)
            };

            await createSaving(savingData);
            console.log('Ahorro creado exitosamente');
            
            // Recargar los ahorros
            const response = await getSavingsByUserId(userId);
            setPersonalSavings(response);
            setFilteredSavings(response.filter(saving => 
                isSameMonth(saving.date, selectedMonth)
            ));
            
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
            selector: row => row.description,
            grow: 0.4,
            minWidth: '100px',
        },
        {
            selector: row => `$${row.amount.toFixed(2)}`,
            grow: 0.3,
            minWidth: '100px',
        },
        {
            selector: row => new Date(row.date).toLocaleDateString(),
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
          boxShadow:'0px 8px 5px rgba(61, 193, 173, 0.2)'
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
          boxShadow:'0px 8px 5px rgba(61, 193, 173, 0.2)',
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
            whiteSpace: 'nowrap',
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
            maxWidth: '100%',
            overflowX: 'auto',
          },
        },
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
          <div className='col-sm-3 d-flex flex-column justify-content-center align-items-center'>
            <div style={styles.card}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
                    <text>AHORROS</text>
                    <GiReceiveMoney style={{ fontSize: '220%'}} />
                </div>
                <text style={styles.cardText}>${totalSavings.toFixed(2)}</text>
                <text style={styles.cardSubtitle}>Ahorros del mes</text>
            </div>
            
            <button
              style={styles.addButton}
              onClick={() => !isDisabled && openForm()}
              disabled={isDisabled}>
              <MdOutlineAddToPhotos style={styles.button} />
              <text style={{alignSelf: 'center'}}>NUEVO AHORRO</text>
            </button>
          </div>
            
          <div className='col-sm-8 flex-column justify-content-center align-items-center'>
          <DataTable
            columns={columns}
            data={filteredSavings}
            customStyles={customStyles}
            pagination
            noDataComponent="No hay ahorros disponibles."
          />
          </div>
        </div>

        {/* Modal */}
        <Modal open={open} onClose={closeForm}>
        <Box sx={styles.modalStyle}>
            <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '20px'}}>
                <text style={styles.title}>Nuevo ahorro</text>
            </div>
            <div>
                <input className='input col-12'
                placeholder='Descripción'
                type="text"
                name="description"
                value={newSaving.description}
                onChange={handleInputChange}
                required
                />
            </div>
            <div>
                <input className='input col-12'
                placeholder='Cantidad'
                type="number"
                name="amount"
                value={newSaving.amount}
                onChange={handleInputChange}
                required
                />
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
