import React, { useState, useEffect } from 'react';
import { getSavingsByUserId, createSaving } from '../../../services/SavingsService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { Divider } from '@mui/material';
import { GiReceiveMoney } from "react-icons/gi";
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { Modal, Box } from '@mui/material';
import { TbPigMoney } from "react-icons/tb";

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
        range: 3,
    });

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
        const centerDate = new Date(center);
        const months = [];
        
        for (let i = -range; i <= range; i++) {
            const date = new Date(centerDate);
            date.setMonth(centerDate.getMonth() + i);
            
            months.push({
                label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                date,
                isStart: i === -range,
                isEnd: i === range
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
                <div style={{ display: 'flex', alignItems: 'left' }}>
                    <CategoryIcon />
                </div>
            ),
            grow: 0.05,
            wrap: true,
            minWidth: '10px',
        },
        {
            selector: row => row.description,
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
            grow: 0.2,
            wrap: true,
            minWidth: '80px',
        },
        {
            selector: row => 'Active',
            grow: 0.22,
            right: true,
            wrap: true,
            sortable: true,
            minWidth: '60px',
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
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          width: '80%',
          marginTop: '50px',
          paddingTop: '30px',
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
          backgroundColor: 'white',
          position: 'fixed',
          top: 30,
          display: 'flex',
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          width: '100vw',
          zIndex: 10,
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
        cardContainer: {
          marginTop: '-50px',
          flexDirection: 'column',
        },
        chartContainer: {
          marginTop: '-90px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50vw',
          zIndex: 1,
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
        buttonText: {
          fontSize: '20px',
          alignSelf: 'center',
        },
        cardSubtitle: {
          fontSize: '16px',
          alignSelf: 'center',
          marginTop: '10px',
          color: 'white',
        },
        button: {
          alignSelf: 'flex-end',
          margin: '15px',
          fontSize: '35px',
          color: '#3DC9A7',
        },
        addButton: {
          cursor: 'pointer',
          border: '1px solid #3DC9A7',
          width: '200px',
          height: '140px',
          margin: '20px 30px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '20px',
          color: 'black',
          boxShadow:'0px 8px 5px rgba(61, 193, 173, 0.2)'
        },
        input: {
          width: 370,
          height: 20,
          backgroundColor: '#EAEAEA',
          padding: 15,
          borderWidth: 0,
          borderRadius: 8,
          color: 'black',
          marginBottom: 15,
          boxShadow: '0px 2px 2px rgba(136, 136, 136, 0.5)'
        },
        selector: {
          width: 400,
          height: 50,
          backgroundColor: '#EAEAEA',
          padding: 15,
          borderWidth: 0,
          borderRadius: 8,
          color: 'black',
          marginBottom: 15,
          boxShadow: '0px 2px 2px rgba(136, 136, 136, 0.5)',
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

      const paths = {
        'BUDGET PLANNING': '/personal-budget-planner',
        'DEBT TRACKER': '/personal-debt-tracker',
        'SAVINGS TRACKER': '/personal-saving-tracker',
        'EXPENSE TRACKER': '/personal-expenses',
        'GRAPHICS': '/personal-graphics',
        'PROFILE': '/personal-profile',
      };
      
      const handleNavigation = (text) => {
        navigate(paths[text] || '/personal-saving-tracker');
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
            {months.map((monthObj, index) => (
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
            <div style={styles.card}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
                    <text>SAVINGS</text>
                    <GiReceiveMoney style={{ fontSize: '40px'}} />
                </div>
                <text style={styles.cardText}>${totalSavings.toFixed(2)}</text>
                <text style={styles.cardSubtitle}>This month's savings</text>
            </div>
            <div style={styles.addButton} onClick={openForm}>
              <MdOutlineAddToPhotos style={styles.button} />
              <text style={styles.buttonText}>ADD SAVING</text>
            </div>
          </div>
            
          <div style={styles.chartContainer}>
          <DataTable
            columns={columns}
            data={filteredSavings}
            customStyles={customStyles}
            pagination
          />
          </div>
        </div>

        {/* Modal */}
        <Modal open={open} onClose={closeForm}>
        <Box sx={styles.modalStyle}>
            <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '20px'}}>
                <text style={styles.title}>Add Saving</text>
            </div>
            <div>
                <input style={styles.input}
                placeholder='Description'
                type="text"
                name="description"
                value={newSaving.description}
                onChange={handleInputChange}
                required
                />
            </div>
            <div>
                <input style={styles.input}
                placeholder='Amount'
                type="number"
                name="amount"
                value={newSaving.amount}
                onChange={handleInputChange}
                required
                />
            </div>
            {/* <div>
                <input style={styles.input}
                type="date"
                name="date"
                value={newSaving.date}
                onChange={handleInputChange}
                required
                />
            </div> */}
            <Divider style={styles.divider} />
            <div style={{ display: 'flex', justifyContent: 'right', marginTop: '20px' }}>
              <button className='primary_button' style={{ width: '35%', marginRight: '10px' }} type="button" onClick={closeForm}>Cancel</button>
              <button className='secondary_button' style={{ width: '35%' }} type="submit">Add</button>
            </div>
            </form>
        </Box>
        </Modal>
      </div>
    );
}
