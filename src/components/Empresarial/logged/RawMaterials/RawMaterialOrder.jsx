// Archivo completo y estilizado con fechas, navegación, tarjetas, y tabla para RawMaterialOrder
import React, { useEffect, useState } from 'react';
import { getOrdersByUserId, createRawMaterialOrder } from '../../../../services/Order';
import { getAvailableMaterialsByUserId } from '../../../../services/MaterialUsageService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { GiPayMoney } from 'react-icons/gi';
import logo from '../../../../assets/logo.png';

export default function RawMaterialOrderTracker() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({ center: new Date(), range: 3 });
    const [materialUsageIds, setMaterialUsageIds] = useState([]);
    const [income, setIncome] = useState('');
    const [orderDescription, setOrderDescription] = useState('');
    const [open, setIsOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [totalNetProfit, setTotalNetProfit] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const openForm = () => setIsOpen(true);
    const closeForm = () => setIsOpen(false);

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

    const handleMultiSelectChange = (e) => {
        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
        setMaterialUsageIds(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        if (!userId || materialUsageIds.length === 0 || !income || !orderDescription) {
            setErrorMessage('Por favor, completa todos los campos.');
            return;
        }

        const orderData = {
            userId,
            materialUsageIds,
            income: parseFloat(income),
            orderDescription,
        };

        try {
            await createRawMaterialOrder(orderData);
            setSuccessMessage('Pedido creado exitosamente ✅');
            setIncome('');
            setOrderDescription('');
            setMaterialUsageIds([]);
            closeForm();
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            setErrorMessage('Error al crear el pedido');
        }
    };

    const paths = {
        'MATERIA PRIMA': '/raw-materials-tracker',
        'INSUMOS': '/material-usage-tracker',
        'PEDIDOS': '/raw-material-order',
    };

    const handleNavigation = (text) => {
        navigate(paths[text] || '/raw-material-order');
    };

    const columns = [
        { name: 'Descripción', selector: row => row.orderDescription, grow: 2 },
        { name: 'Ingreso ($)', selector: row => `$${row.income}`, grow: 1 },
        { name: 'Fecha', selector: row => row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Sin fecha', grow: 2 },
    ];

    const styles = {
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
        menu: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '80%',
            marginBottom: '30px',
        },
        navLink: (path) => ({
            cursor: 'pointer',
            padding: '10px 20px',
            fontSize: '16px',
            color: location.pathname === path ? '#000' : '#888',
            borderBottom: location.pathname === path ? '4px solid #30437A' : '2px solid transparent',
        }),
        card: {
            backgroundColor: '#30437A',
            color: 'white',
            width: '200px',
            height: '140px',
            marginBottom: '20px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)'
        },
        addButton: {
            cursor: 'pointer',
            border: '1px solid #30437A',
            width: '200px',
            height: '140px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '20px',
            color: 'black',
            boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        datePicker: {
            marginTop: 180,
            display: 'flex',
            justifyContent: 'center',
        },
        cardText: {
            fontSize: '20px',
            fontWeight: 'bold',
        },
        tableContainer: {
            width: '70%',
            margin: '20px auto',
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
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            backgroundColor: '#f0f0f0',
            border: 'none',
        },
    };

    return (
        <div>
            <div style={styles.header}>
                <div style={styles.menu}>
                    <img src={logo} alt="Logo" style={{ width: '90px' }} />
                    {Object.keys(paths).map((text, index) => (
                        <span
                            key={index}
                            style={styles.navLink(paths[text])}
                            onClick={() => handleNavigation(text)}
                        >
                            {text}
                        </span>
                    ))}
                </div>
                <Divider style={{ width: '100%', margin: '0 auto' }} />
            </div>

            <div style={styles.datePicker}>
                {months.map((monthObj, index) => (
                    <span
                        key={index}
                        onClick={() => handleMonthSelect(monthObj)}
                        style={{
                            margin: '0 15px',
                            cursor: 'pointer',
                            color: isSameMonth(monthObj.date, selectedMonth) ? '#000' : '#B0B0B0',
                            borderBottom: isSameMonth(monthObj.date, selectedMonth) ? '2px solid #4AD8C2' : 'none',
                            fontWeight: isSameMonth(monthObj.date, selectedMonth) ? 'bold' : 'normal'
                        }}
                    >
                        {monthObj.label}
                    </span>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <div style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>INGRESO</span>
                        <GiPayMoney style={{ fontSize: '40px' }} />
                    </div>
                    <span style={styles.cardText}>${totalNetProfit}</span>
                    <span style={{ fontSize: '16px', color: '#B0B0B0' }}>Ingreso mensual</span>
                </div>

                <div style={styles.addButton} onClick={openForm}>
                    <MdOutlineAddToPhotos style={{ fontSize: '35px' }} />
                    <span style={{ fontSize: '18px', marginTop: '10px' }}>CREAR PEDIDO</span>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <DataTable
                    columns={columns}
                    data={filteredOrders}
                    pagination
                    noDataComponent="No hay pedidos registrados."
                />
            </div>

            <Modal open={open} onClose={closeForm}>
                <Box sx={styles.modalStyle}>
                    <form onSubmit={handleSubmit}>
                        <h2 style={{ color: '#30437A' }}>Crear Pedido</h2>
                        <input
                            style={styles.input}
                            placeholder="Descripción del pedido"
                            value={orderDescription}
                            onChange={(e) => setOrderDescription(e.target.value)}
                            required
                        />
                        <select
                            style={styles.input}
                            multiple
                            value={materialUsageIds}
                            onChange={handleMultiSelectChange}
                            required
                        >
                            {rawMaterials.map((material) => (
                                <option key={material.id} value={material.id}>
                                    {material.usageDescription} - {material.quantityUsed} unidades
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            style={styles.input}
                            placeholder="Ingreso del pedido ($)"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            required
                        />
                        <Divider style={{ margin: '20px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={closeForm} style={{ marginRight: '10px' }}>Cancelar</button>
                            <button type="submit">Registrar</button>
                        </div>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                    </form>
                </Box>
            </Modal>
        </div>
    );
}
