import React, { useState, useEffect } from 'react';
import { getPersonalExpensesByUserId, createPersonalExpense } from '../../../services/PersonalExpensesService';
import { getAllCategories } from '../../../services/CategoriesService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { Divider } from '@mui/material';
import { GiPayMoney } from 'react-icons/gi';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { Modal, Box } from '@mui/material';
import { MdOutlineFastfood, MdOutlineSchool } from 'react-icons/md';
import { IoShirtOutline, IoCarSportOutline } from 'react-icons/io5';
import { RiHome2Line } from 'react-icons/ri';
import { FaTheaterMasks, FaRegHospital } from 'react-icons/fa';

export default function PersonalExpensesTracker() {
    const [personalExpenses, setPersonalExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categories, setCategories] = useState([]);  // Estado para las categorías
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        categoryName: '',
    });  // Estado para el nuevo gasto
    const [open, setIsOpen] = React.useState(false); //Estado para abrir el modal de crear gasto
    const openForm = () => setIsOpen(true); //Settear el estado del modal de crear gasto para abrir
    const closeForm = () => setIsOpen(false); //Settear el estado del modal de crear gasto para cerrar
    const navigate = useNavigate();
    const location = useLocation();

    // Cargar los gastos
    useEffect(() => {
        const fetchPersonalExpenses = async () => {
            const userId = localStorage.getItem('userId');

            if (!userId) {
                navigate('/login-personal'); // Redirige si no hay userId
                return;
            }

            try {
                const response = await getPersonalExpensesByUserId(userId);
                console.log('Gastos personales obtenidos:', response);

                if (!response || !Array.isArray(response)) {
                    console.warn('No hay gastos registrados para este usuario.');
                    setPersonalExpenses([]); // ✅ Evita crasheos
                    setFilteredExpenses([]); // ✅ Evita crasheos también en los gastos filtrados
                    return;
                }

                const fetchedExpenses = response.map(expense => ({
                    ...expense,
                    categoryName: expense.categoryName || 'Sin categoría',
                }));

                setPersonalExpenses(fetchedExpenses);
                setFilteredExpenses(fetchedExpenses); // Inicializa los gastos filtrados
            } catch (error) {
                console.error('Error al obtener los gastos personales:', error);
            }
        };

        fetchPersonalExpenses();
    }, [navigate]);

    // Obtener categorías para el selector
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();  // Llamada a la API para obtener las categorías
                setCategories(data);  // Establecemos las categorías en el estado
            } catch (error) {
                console.error('Error al obtener las categorías:', error);
            }
        };

        fetchCategories();
    }, []);

    // Manejar cambio en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExpense({
            ...newExpense,
            [name]: value,
        });
    };

    // Enviar el formulario para crear un nuevo gasto
    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        if (!userId) {
            navigate('/login-personal');
            return;
        }

        const expenseData = {
            ...newExpense,
            userId,
        };

        try {
            const createdExpense = await createPersonalExpense(expenseData);
            console.log('Gasto creado:', createdExpense);

            const category = categories.find(cat => cat.id === createdExpense.categoryId);
            createdExpense.categoryName = category ? category.name : 'Sin categoría';

            setPersonalExpenses((prevExpenses) => [...prevExpenses, createdExpense]);
            setFilteredExpenses((prevExpenses) => [...prevExpenses, createdExpense]);

            // Limpiar el formulario
            setNewExpense({
                description: '',
                amount: '',
                categoryId: '',
            });
            closeForm(); // Cerrar el modal
        } catch (error) {
            console.error('Error al crear el gasto:', error);
        }
    };

    // Preparar los datos para el gráfico de pastel
    const categoryData = () => {
        const categoryCounts = personalExpenses.reduce((acc, expense) => {
            const categoryName = expense.categoryName || 'Sin categoría';
            acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
            return acc;
        }, {});

        const labels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#F5A623', '#F9A825', '#8E24AA'],
                    hoverOffset: 4,
                },
            ],
        };
    };

    // Filtrar los gastos cuando se selecciona una categoría en el gráfico de pastel
    const handleCategoryClick = (event, elements) => {
        if (elements.length > 0) {
            const categoryName = categoryData().labels[elements[0].index];
            const filtered = personalExpenses.filter(expense => expense.categoryName === categoryName);
            setFilteredExpenses(filtered); // Actualiza los gastos filtrados
        }
    };

    // Definir las columnas
    const columns = [
        {
          selector: row => (
            <div style={{ display: 'flex', alignItems: 'left' }}>
              <CategoryIcon category={row.categoryName} />
            </div>
          ),
          grow: 0.05,
          wrap: true,
          minWidth: '10px',
        },
        {
          selector: row => (<strong>{row.description}</strong>),
          grow: 0.3,
          wrap: true,
          minWidth: '120px',
        },
        {
          selector: row => '-$' + row.amount,
          grow: 0.2,
          right: true,
          wrap: true,
          minWidth: '80px',
        },
        {
          selector: row => new Date(row.date).toLocaleString(),
          grow: 0.22,
          right: true,
          wrap: true,
          sortable: true,
          minWidth: '60px',
        },
      ];      
      
      const CategoryIcon = ({ category }) => {
        const iconMap = {
          Food: <MdOutlineFastfood />,
          Clothes: <IoShirtOutline />,
          Transport: <IoCarSportOutline />,
          Home: <RiHome2Line />,
          Entertainment: <FaTheaterMasks />,
          Health: <FaRegHospital />,
          Education: <MdOutlineSchool />,
        };
      
        const categoryColors = {
          Food: '#ff6347',
          Clothes: '#4682b4',
          Transport: '#32cd32',
          Home: '#ff8c00',
          Entertainment: '#8a2be2',
          Health: '#3cb371',
          Education: '#f4a300',
        };
      
        const icon = iconMap[category] || '❓';
        const color = categoryColors[category] || '#808080';
      
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
          backgroundColor: '#30437A',
          color: 'white',
          width: '200px',
          height: '140px',
          margin: '20px 30px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '20px',
          boxShadow:'0px 8px 5px rgba(48, 55, 122, 0.2)'
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
          color: '#B0B0B0',
        },
        button: {
          alignSelf: 'flex-end',
          margin: '15px',
          fontSize: '35px',
          color: '#30437A',
        },
        addButton: {
          cursor: 'pointer',
          border: '1px solid #30437A',
          width: '200px',
          height: '140px',
          margin: '20px 30px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '20px',
          color: 'black',
          boxShadow:'0px 8px 5px rgba(48, 55, 122, 0.2)'
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
          boxShadow: '0px 2px 2px rgba(136, 136, 136, 0.5)',
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

      const paths = {
        'BUDGET PLANNING': '/personal-budget-planner',
        'DEBT TRACKER': '/personal-debt-tracker',
        'SAVINGS TRACKER': '/personal-saving-tracker',
        'EXPENSE TRACKER': '/personal-expenses',
        'GRAPHICS': '/personal-graphics',
        'PROFILE': '/personal-profile',
      };
      
      const handleNavigation = (text) => {
        navigate(paths[text] || '/personal-expenses');
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
            <div style={styles.card}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
                    <text>SPENT</text>
                    <GiPayMoney style={{ fontSize: '40px'}} />
                </div>
                <text style={styles.cardText}>-$50,000</text>
                <text style={styles.cardSubtitle}>This month's expenses</text>
            </div>
            <div style={styles.addButton} onClick={openForm}>
              <MdOutlineAddToPhotos style={styles.button} />
              <text style={styles.buttonText}>ADD EXPENSE</text>
            </div>
          </div>
            
          <div style={styles.chartContainer}>
          <DataTable
            columns={columns}
            data={filteredExpenses}
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
                <text style={styles.title}>Add Expense</text>
            </div>
            <div>
                <input style={styles.input}
                placeholder='Description'
                type="text"
                name="description"
                value={newExpense.description}
                onChange={handleInputChange}
                required
                />
            </div>
            <div>
                <input style={styles.input}
                placeholder='Amount'
                type="number"
                name="amount"
                value={newExpense.amount}
                onChange={handleInputChange}
                required
                />
            </div>
            <div>
                <select style={styles.selector}
                name="categoryId"
                value={newExpense.categoryId}
                onChange={handleInputChange}
                required
                >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                    {category.name}
                    </option>
                ))}
                </select>
            </div>
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
