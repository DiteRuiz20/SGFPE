import React, { useState, useEffect } from 'react';
import { getNewProductOrdersByUser, createNewProductOrder } from '../../../../services/NewProductOrder';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { getNewProductExpensesByUser } from '../../../../services/NewProductService';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import { BsBoxSeam } from "react-icons/bs";
import { BsTrash } from "react-icons/bs";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';

const schema = yup.object().shape({
  orderDescription: yup.string().required('La descripción es obligatoria').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  income: yup
    .number()
    .typeError('El ingreso debe ser un número')
    .positive('El ingreso debe ser mayor a 0')
    .required('El ingreso es obligatorio'),
  items: yup.array().min(1, 'Debes seleccionar al menos un producto').required('El producto es obligatorio'),
});

const customStyles = {
  cells: {
    style: {
      color: '#333',
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

export default function NewProductOrderTracker() {
  const [orders, setOrders] = useState([]);
  const [open, setIsOpen] = useState(false);
  const [form, setForm] = useState({ orderDescription: '', income: '', items: [] });
  const navigate = useNavigate();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });

  const isSameMonth = (date1, date2) => new Date(date1).getFullYear() === new Date(date2).getFullYear() && new Date(date1).getMonth() === new Date(date2).getMonth();

  const openForm = () => setIsOpen(true);
  const closeForm = () => {
    resetFormState();
    setIsOpen(false);
  };

  const isCurrentMonth = () => {
    const current = new Date();
    return selectedMonth.getFullYear() === current.getFullYear() && selectedMonth.getMonth() === current.getMonth();
  };

  const isDisabled = !isCurrentMonth();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const userId = localStorage.getItem('userId');

  const fetchAvailableProducts = async () => {
    try {
      const response = await getNewProductExpensesByUser(userId);
      setAvailableProducts(response.data || []);
    } catch (error) {
      console.error('Error al obtener productos disponibles:', error);
    }
  };

  const fetchOrders = async () => {
    if (!userId) return navigate('/login-personal');
    try {
      const response = await getNewProductOrdersByUser(userId);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error al obtener órdenes:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAvailableProducts();
  }, []);

  const resetFormState = () => {
    setForm({ orderDescription: '', income: '', items: [] });
    setValue("orderDescription", "");
    setValue("income", "");
    setValue("items", []);
  };

  const handleCreateOrder = async (data) => {
    try {
      const payload = {
        userId,
        orderDescription: data.orderDescription,
        orderDate: new Date(),
        income: parseFloat(data.income),
        items: form.items
      };
      await createNewProductOrder(payload);
      closeForm();
      fetchOrders();
      fetchAvailableProducts();
    } catch (err) {
      console.error('Error al crear orden:', err);
    }
  };

  const columns = [
    { name: 'Descripción', selector: row => row.orderDescription, grow: 1 },
    {
      name: 'Fecha',
      selector: row => {
        const date = new Date(row.orderDate);
        return date.toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).replace('de ', 'de ').replace(' de ', ' de ').replace(/,/, '');
      },
      grow: 1
    },
    { name: 'Ingreso', selector: row => `$${row.income}`, grow: 1 },
    { name: 'Costo Total', selector: row => `$${row.totalOrderCost}`, grow: 1 },
    { name: 'Ganancia Neta', selector: row => `$${row.netProfit}`, grow: 1 },
  ];

  const filteredOrders = orders.filter(order => isSameMonth(order.orderDate, selectedMonth));
  filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  const totalNetProfit = filteredOrders.reduce((sum, order) => sum + (order.netProfit || 0), 0);

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
    deleteButton: {
      fontSize: '20px',
      color: '#f00',
    },
    buttonCell: {
      width: '100px',
      textAlign: 'center',
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
          setDateWindow={setDateWindow} />

        <Divider style={styles.divider} />
      </div>

      <div className='row mt-3'>
        <div className='col-sm-3 d-flex flex-column justify-content-center align-items-center'>
          <div style={styles.card}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
              <text>ÓRDENES</text>
              <BsBoxSeam style={{ fontSize: '190%' }} />
            </div>

            <text style={styles.cardText}>${totalNetProfit.toFixed(2)}</text>
            <text style={styles.cardSubtitle}>Órdenes hechas</text>
          </div>

          <button
            style={styles.addButton}
            onClick={() => !isDisabled && openForm()}
            disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>NUEVA ORDEN</text>
          </button>
        </div>

        <div className='col-sm-8 flex-column justify-content-center align-items-center'>
          <DataTable
            columns={columns}
            data={filteredOrders}
            pagination
            noDataComponent="No hay órdenes registradas en este mes."
          />
        </div>

        <Modal open={open} onClose={() => closeForm()}>
          <Box sx={styles.modalStyle}>
            <form onSubmit={handleSubmit(handleCreateOrder)}>
              <div style={{ marginBottom: '20px' }}>
                <text style={styles.title}>Nueva orden</text>
              </div>

              <input className='input col-12'
                type="text"
                placeholder="Descripción del pedido"
                {...register('orderDescription')}
              />
              {errors.orderDescription && <p style={{ color: 'red' }}>{errors.orderDescription.message}</p>}

              <input className='input col-12'
                type="number"
                step={0.01}
                placeholder="Ingreso"
                {...register('income')}
              />
              {errors.income && <p style={{ color: 'red' }}>{errors.income.message}</p>}

              <select
                className='input col-12'
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selected = availableProducts.find(p => p.id === selectedId);

                  if (selected) {
                    const alreadyAdded = form.items.some(item => item.productId === selected.id);
                    if (alreadyAdded) return;

                    const updatedItems = [...form.items, {
                      productId: selected.id,
                      productDescription: selected.productDescription,
                      quantity: 1,
                      unitCost: selected.unitCost
                    }];

                    setForm(prev => ({ ...prev, items: updatedItems }));
                    setValue("items", updatedItems); // sync with react-hook-form
                    e.target.value = ""; // reset select
                  }
                }}
              >
                <option value="">Selecciona un producto</option>
                {availableProducts
                  .filter(p => !form.items.some(item => item.productId === p.id))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.productDescription} - {p.quantity} disponibles
                    </option>
                  ))}
              </select>

              {errors.items && (<p style={{ color: 'red' }}>{errors.items.message}</p>)}

              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th style={{ textAlign: 'center' }}>Eliminar</th>
                  </tr>
                </thead>

                <tbody>
                  {form.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productDescription}</td>

                      <td>
                        <input className='input col-10'
                          type="number"
                          min="1"
                          max={availableProducts.find(p => p.id === item.productId)?.quantity || 1}
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setForm(prev => {
                              const updatedItems = [...prev.items];
                              updatedItems[index].quantity = value;
                              return { ...prev, items: updatedItems };
                            });
                          }}
                        />
                      </td>

                      <td style={styles.buttonCell}>
                        <button
                          type="button"
                          style={{ backgroundColor: 'white' }}
                          onClick={() => {
                            setForm(prev => ({
                              ...prev, items: prev.items.filter((_, i) => i !== index)
                            }));
                          }}>
                          <BsTrash style={styles.deleteButton} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
