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

export default function NewProductOrderTracker() {
    const [orders, setOrders] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [form, setForm] = useState({ orderDescription: '', income: 0, items: [] });
    const navigate = useNavigate();
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });

    const openForm = () => setIsOpen(true);
    const closeForm = () => setIsOpen(false);

    const isCurrentMonth = () => {
        const currentMonth = new Date();
        return selectedMonth.getFullYear() === currentMonth.getFullYear() &&
               selectedMonth.getMonth() === currentMonth.getMonth();
      };
  
    const isDisabled = !isCurrentMonth();

    const fetchAvailableProducts = async () => {
        try {
            const response = await getNewProductExpensesByUser(userId);
            setAvailableProducts(response.data || []);
        } catch (error) {
            console.error('Error al obtener productos disponibles:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchAvailableProducts();
    }, []);


    const userId = localStorage.getItem('userId');

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
    }, []);

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                userId,
                income: parseFloat(form.income),
            };
            await createNewProductOrder(payload);
            setOpenModal(false);
            fetchOrders();
        } catch (err) {
            console.error('Error al crear orden:', err);
        }
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

    const columns = [
        { name: 'Descripción', selector: row => row.orderDescription, grow: 1 },
        { name: 'Fecha', selector: row => new Date(row.orderDate).toLocaleDateString(), grow: 1 },
        { name: 'Ingreso', selector: row => `$${row.income}`, grow: 1 },
        { name: 'Costo Total', selector: row => `$${row.totalOrderCost}`, grow: 1 },
        { name: 'Ganancia Neta', selector: row => `$${row.netProfit}`, grow: 1 },
    ];

    return (
    <div>
      <div className="row justify-content-center">
        <TopNavBar/>

        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
          dateWindow={dateWindow}
          setDateWindow={setDateWindow}/>

        <Divider style={styles.divider} />
      </div>
    
      <div className='row mt-3'>
        <div className='col-sm-3 d-flex flex-column justify-content-center align-items-center'>
          <div style={styles.card}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
              <text>ÓRDENES</text>
              <BsBoxSeam style={{ fontSize: '190%' }} />
            </div>

            <text style={styles.cardText}>$100</text>
            <text style={styles.cardSubtitle}>Órdenes hechas</text>
          </div>

          <button
            style={styles.addButton}
            onClick={() => !isDisabled && openForm()}
            disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{alignSelf: 'center'}}>NUEVA ORDEN</text>
          </button>
        </div>

        <div className='col-sm-8 flex-column justify-content-center align-items-center'>
          <DataTable
            columns={columns}
            data={orders}
            pagination
            noDataComponent="No hay órdenes registradas."
          />
        </div>

            <Modal open={openModal} onClose={() => closeForm()}>
                <Box sx={styles.modalStyle}>
                    <form onSubmit={handleCreateOrder}>
                        <div style={{ marginBottom: '20px' }}>
                            <text style={styles.title}>Crear nueva orden</text>
                        </div>
                        <input className='input col-12'
                            type="text"
                            placeholder="Descripción del pedido"
                            value={form.orderDescription}
                            onChange={(e) => setForm({ ...form, orderDescription: e.target.value })}
                            required
                        />
                        <input className='input col-12'
                            type="number"
                            step="0.01"
                            placeholder="Ingreso"
                            value={form.income}
                            onChange={(e) => setForm({ ...form, income: e.target.value })}
                            required
                        />
                        {/* Aquí puedes integrar un selector de productos y cantidades */}
                        <button type="submit">Crear</button>
                    </form>
                    <select
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            const selected = availableProducts.find(p => p.id === selectedId);
                            if (selected) {
                                setForm(prev => ({
                                    ...prev,
                                    items: [...prev.items, {
                                        productId: selected.id,
                                        productDescription: selected.productDescription,
                                        quantity: 1,
                                        unitCost: selected.unitCost
                                    }]
                                }));
                            }
                        }}
                    >
                        <option value="">Selecciona un producto</option>
                        {availableProducts.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.productDescription} - {p.quantity} disponibles
                            </option>
                        ))}
                    </select>
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.productDescription}</td>
                                    <td>
                                        <input
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
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm(prev => ({
                                                    ...prev,
                                                    items: prev.items.filter((_, i) => i !== index)
                                                }));
                                            }}
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Modal>
        </div>
        </div>
    );
}
