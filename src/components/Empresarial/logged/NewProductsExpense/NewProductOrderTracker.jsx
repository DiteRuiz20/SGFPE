import React, { useState, useEffect } from 'react';
import { getNewProductOrdersByUser, createNewProductOrder } from '../../../../services/NewProductOrder';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { getNewProductExpensesByUser } from '../../../../services/NewProductService';
import TopNavBar from './TopNavBar';

export default function NewProductOrderTracker() {
    const [orders, setOrders] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [form, setForm] = useState({ orderDescription: '', income: 0, items: [] });
    const navigate = useNavigate();
    const [availableProducts, setAvailableProducts] = useState([]);

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

    const columns = [
        { name: 'Descripción', selector: row => row.orderDescription, grow: 1 },
        { name: 'Fecha', selector: row => new Date(row.orderDate).toLocaleDateString(), grow: 1 },
        { name: 'Ingreso', selector: row => `$${row.income}`, grow: 1 },
        { name: 'Costo Total', selector: row => `$${row.totalOrderCost}`, grow: 1 },
        { name: 'Ganancia Neta', selector: row => `$${row.netProfit}`, grow: 1 },
    ];

    return (
        <div style={{ padding: '2rem' }}>
            <TopNavBar />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>Órdenes Registradas</h2>
                <button onClick={() => setOpenModal(true)}><MdOutlineAddToPhotos /> Nueva Orden</button>
            </div>
            <DataTable
                columns={columns}
                data={orders}
                pagination
                noDataComponent="No hay órdenes registradas."
            />

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: '8px',
                }}>
                    <form onSubmit={handleCreateOrder}>
                        <h3>Crear nueva orden</h3>
                        <input
                            type="text"
                            placeholder="Descripción del pedido"
                            value={form.orderDescription}
                            onChange={(e) => setForm({ ...form, orderDescription: e.target.value })}
                            required
                        />
                        <input
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
    );
}
