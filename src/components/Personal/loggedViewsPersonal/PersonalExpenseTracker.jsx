import React, { useState, useEffect } from 'react';
import { getPersonalExpensesByUserId, createPersonalExpense } from '../../../services/PersonalExpensesService';
import { getAllCategories } from '../../../services/CategoriesService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useLocation } from 'react-router-dom';
import { Divider } from '@mui/material';
import { GiPayMoney } from 'react-icons/gi';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { Modal, Box } from '@mui/material';
import { MdOutlineFastfood, MdOutlineSchool } from 'react-icons/md';
import { IoShirtOutline, IoCarSportOutline } from 'react-icons/io5';
import { RiHome2Line } from 'react-icons/ri';
import { FaTheaterMasks, FaRegHospital } from 'react-icons/fa';
import MonthSelector from '../../MonthSelector';
import TopNavBar from './TopNavBar';
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
  category: yup.string().required('La categoría es obligatoria'),
});

export default function PersonalExpensesTracker() {
  const [personalExpenses, setPersonalExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [categories, setCategories] = useState([]);  // Estado para las categorías

  // Configuración para el selector de fechas
  const [dateWindow, setDateWindow] = useState({
    center: new Date(), // Fecha central (actual)
    offset: 3,           // Número de meses a cada lado (total: 2*range + 1)
  });

  const isCurrentMonth = () => {
    const currentMonth = new Date();
    return selectedMonth.getFullYear() === currentMonth.getFullYear() &&
      selectedMonth.getMonth() === currentMonth.getMonth();
  };

  const isDisabled = !isCurrentMonth();

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    categoryName: '',
  });  // Estado para el nuevo gasto
  const [open, setIsOpen] = React.useState(false); //Estado para abrir el modal de crear gasto
  const openForm = () => {
    reset();
    setIsOpen(true);
  };
  const closeForm = () => {
    reset();
    setIsOpen(false);
  };
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const filtered = personalExpenses.filter(exp =>
      isSameMonth(exp.date, selectedMonth)
    );
    setFilteredExpenses(filtered);

    setTotalExpenses(filtered.reduce((sum, exp) => sum + parseFloat(exp.amount), 0));
    console.log('Total de gastos del mes seleccionado:', totalExpenses);
  }, [personalExpenses, selectedMonth]);

  // Cargar los gastos
  useEffect(() => {
    const fetchPersonalExpenses = async () => {
      const userId = localStorage.getItem('userId');
      console.log("ddatos del usuario", userId)
      if (!userId) {
        console.log('usuario null')
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

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Enviar el formulario para crear un nuevo gasto
  const onSubmit = async (data) => {
    try {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        navigate('/login-personal');
        return;
      }

      const expenseData = {
        ...newExpense,
        userId: userId,
        description: data.description,
        amount: parseFloat(data.amount),
        categoryId: data.category,
        date: new Date().toISOString()
      };

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

  filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon category={row.categoryName} />
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
      selector: row => '$' + row.amount,
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

  const CategoryIcon = ({ category }) => {
    const iconMap = {
      Comida: <MdOutlineFastfood />,
      Vestimenta: <IoShirtOutline />,
      Transporte: <IoCarSportOutline />,
      Hogar: <RiHome2Line />,
      Entretenimiento: <FaTheaterMasks />,
      Salud: <FaRegHospital />,
      Educación: <MdOutlineSchool />,
    };

    const categoryColors = {
      Comida: '#ff6347',
      Vestimenta: '#4682b4',
      Transporte: '#32cd32',
      Hogar: '#ff8c00',
      Entretenimiento: '#8a2be2',
      Salud: '#3cb371',
      Educación: '#f4a300',
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
    divider: {
      width: '100%',
      height: '2px',
      backgroundColor: '#999',
      marginTop: 20,
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
      boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)'
    },
    button: {
      alignSelf: 'flex-end',
      margin: '10px',
      fontSize: '35px',
      color: '#30437A',
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
      border: '1px solid #30437A',
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
      boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)',
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
      color: '#30437A',
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
              <text>GASTOS</text>
              <GiPayMoney style={{ fontSize: '220%' }} />
            </div>

            <text style={styles.cardText}>${totalExpenses.toFixed(2)}</text>
            <text style={styles.cardSubtitle}>Gastos del mes</text>
          </div>

          <button
            style={styles.addButton}
            onClick={() => !isDisabled && openForm()}
            disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>NUEVO GASTO</text>
          </button>
        </div>

        <div className='col-sm-8 flex-column justify-content-center align-items-center'>
          <DataTable
            columns={columns}
            data={filteredExpenses}
            pagination
            noDataComponent="No hay gastos disponibles."
            customStyles={customStyles}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={closeForm}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '20px' }}>
              <text style={styles.title}>Nuevo gasto</text>
            </div>
            <div>
              <input className='input col-12'
                placeholder='Description'
                type="text"
                {...register('description')}
              />
              {errors.description && <p style={{ color: 'red' }}>{errors.description.message}</p>}
            </div>
            <div>
              <input className='input col-12'
                placeholder='Amount'
                step={0.01}
                type="number"
                {...register('amount')}
              />
              {errors.amount && <p style={{ color: 'red' }}>{errors.amount.message}</p>}
            </div>
            <div>
              <select className='input col-12'
                name="categoryId"
                {...register('category')}
              >
                <option value="">Escoge una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <p style={{ color: 'red' }}>{errors.category.message}</p>}
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
