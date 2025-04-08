// Archivo completo y estilizado con fechas, navegación, tarjetas, y tabla para RawMaterialOrder
import React, { useEffect, useState } from 'react';
import { getOrdersByUserId, createRawMaterialOrder } from '../../../../services/Order';
import { getAvailableMaterialsByUserId } from '../../../../services/MaterialUsageService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { GiPayMoney } from 'react-icons/gi';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import Select from 'react-select';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';

const schema = yup.object().shape({
  orderDescription: yup.string().required('La descripción es obligatoria').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  income: yup
    .number()
    .typeError('Debe ser un número válido')
    .positive('Debe ser mayor a 0')
    .test('max-two-decimals', 'Máximo dos decimales', value =>
      /^\d+(\.\d{1,2})?$/.test(value?.toString())
    )
    .required('La cantidad es obligatoria'),
  materialUsageIds: yup.array().min(1, 'Debes seleccionar al menos un material').required('La materia prima es obligatoria'),
});

export default function RawMaterialOrderTracker() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });
  const [materialUsageIds, setMaterialUsageIds] = useState([]);
  const [income, setIncome] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [open, setIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalNetProfit, setTotalNetProfit] = useState(0);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return navigate('/login-personal');

    try {
      const response = await getOrdersByUserId(userId);
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    }
  };

  const location = useLocation();
  const openForm = () => {
    reset(); // Limpia campos
    setIsOpen(true);
  };

  const closeForm = () => {
    reset(); // Limpia también al cerrar
    setIsOpen(false);
  };

  const materialOptions = rawMaterials.map((material) => ({
    value: material.id,
    label: `${material.usageDescription} - ${material.quantityUsed} unidades`,
  }));

  const isCurrentMonth = () => {
    const currentMonth = new Date();
    return selectedMonth.getFullYear() === currentMonth.getFullYear() &&
      selectedMonth.getMonth() === currentMonth.getMonth();
  };

  const isDisabled = !isCurrentMonth();

  const isSameMonth = (date1, date2) => {
    return (
      new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
      new Date(date1).getMonth() === new Date(date2).getMonth()
    );
  };

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
        isEnd: i === range,
      });
    }
    return months;
  };

  const months = generateMonths();

  const handleMonthSelect = (monthObj) => {
    setSelectedMonth(monthObj.date);
    if (monthObj.isStart) {
      const newCenter = new Date(dateWindow.center);
      newCenter.setMonth(newCenter.getMonth() - 3);
      setDateWindow((prev) => ({ ...prev, center: newCenter }));
    } else if (monthObj.isEnd) {
      const newCenter = new Date(dateWindow.center);
      newCenter.setMonth(newCenter.getMonth() + 3);
      setDateWindow((prev) => ({ ...prev, center: newCenter }));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);


  useEffect(() => {
    const filtered = orders.filter((order) => isSameMonth(order.createdAt, selectedMonth));
    setFilteredOrders(filtered);
    const total = filtered.reduce((sum, order) => sum + (order.netProfit || 0), 0);
    setTotalNetProfit(total);
  }, [orders, selectedMonth]);

  useEffect(() => {
    const fetchMaterials = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return navigate('/login-personal');

      try {
        const response = await getAvailableMaterialsByUserId(userId);
        if (Array.isArray(response.data)) {
          setRawMaterials(response.data);
        }
      } catch (error) {
        console.error('Error al obtener materiales disponibles:', error);
      }
    };

    fetchMaterials();
  }, [navigate]);

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        return;
      }

      const orderData = {
        userId,
        materialUsageIds: data.materialUsageIds,
        income: parseFloat(data.income),
        orderDescription: data.orderDescription,
      };

      await createRawMaterialOrder(orderData);
      setSuccessMessage('Pedido creado exitosamente ✅');
      setIncome('');
      setOrderDescription('');
      setMaterialUsageIds([]);
      closeForm();

      // Llamada a fetchOrders para actualizar la lista de órdenes
      fetchOrders();  // Actualiza los pedidos inmediatamente después de crear uno nuevo

    } catch (error) {
      console.error('Error al crear el pedido:', error);
      setErrorMessage('Error al crear el pedido');
    }
  };

  const columns = [
    { name: 'Descripción', selector: row => row.orderDescription, grow: 2 },
    { name: 'Ingreso ($)', selector: row => `$${row.income}`, grow: 1 },
    {
      name: 'Fecha', selector: row =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).replace(' de ', ' de ').replace(',', '')
            .replace(/(\d+) de (\w+) de (\d+)/, '$1 de $2 del $3')
          : 'Sin fecha',
      grow: 2
    },
  ];

  filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
              <text>INGRESO</text>
              <GiPayMoney style={{ fontSize: '40px' }} />
            </div>
            <text style={styles.cardText}>${totalNetProfit}</text>
            <text style={styles.cardSubtitle}>Ingreso mensual</text>
          </div>

          <button
            style={styles.addButton}
            onClick={() => !isDisabled && openForm()}
            disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>NUEVO PEDIDO</text>
          </button>
        </div>

        <div className='col-sm-8 flex-column justify-content-center align-items-center'>
          <DataTable
            columns={columns}
            data={filteredOrders}
            pagination
            noDataComponent="No hay pedidos registrados."
            customStyles={customStyles}
          />
        </div>

        <Modal open={open} onClose={closeForm}>
          <Box sx={styles.modalStyle}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: '20px' }}>
                <text style={styles.title}>Crear Pedido</text>
              </div>
              <input className='input col-12'
                placeholder="Descripción del pedido"
                {...register('orderDescription')}
              />
              {errors.orderDescription && <p style={{ color: 'red' }}>{errors.orderDescription.message}</p>}

              <Controller
                name="materialUsageIds"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    options={materialOptions}
                    className={`input col-12 basic-multi-select ${errors.materialUsageIds ? 'is-invalid' : ''}`}
                    classNamePrefix="select"
                    onChange={(selected) => field.onChange(selected.map(option => option.value))}
                    value={materialOptions.filter(option =>
                      field.value?.includes(option.value)
                    )}
                  />
                )}
              />
              {errors.materialUsageIds && (
                <p style={{ color: 'red' }}>{errors.materialUsageIds.message}</p>
              )}

              <input
                className='input col-12'
                type="number"
                step="0.01"
                placeholder="Ingreso del pedido ($)"
                {...register('income')}
              />

              {errors.income && <p style={{ color: 'red' }}>{errors.income.message}</p>}

              <Divider style={styles.divider} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button className='primary_button' style={{ width: '40%' }} type="button" onClick={closeForm}>Cancelar</button>
                <button className='secondary_button' style={{ width: '40%' }} type="submit">Registrar</button>
              </div>
            </form>
          </Box>
        </Modal>
      </div>
    </div>
  );
}
