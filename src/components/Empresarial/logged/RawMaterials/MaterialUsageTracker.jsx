import React, { useState, useEffect } from 'react';
import { getRawMaterialsByUser } from '../../../../services/RawMaterialService';
import { createMaterialUsage, getMaterialUsagesByUserId } from '../../../../services/MaterialUsageService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { GiPayMoney } from 'react-icons/gi';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { Modal, Box, Divider } from '@mui/material';
import logo from '../../../../assets/logo.png';

export default function MaterialUsageTracker() {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [materialUsages, setMaterialUsages] = useState([]);
    const [filteredUsages, setFilteredUsages] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({ center: new Date(), range: 3 });
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [quantityUsed, setQuantityUsed] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [open, setIsOpen] = useState(false);
    const [totalCost, setTotalCost] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    const openForm = () => setIsOpen(true);
    const closeForm = () => setIsOpen(false);

    const paths = {
        'MATERIA PRIMA': '/raw-materials-tracker',
        'INSUMOS': '/material-usage-tracker',
        'PEDIDOS': '/raw-material-order',
    };

    const handleNavigation = (text) => {
        navigate(paths[text] || '/raw-material-tracker');
    };

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
        const fetchRawMaterials = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return navigate('/login-personal');

            try {
                const response = await getRawMaterialsByUser(userId);
                if (Array.isArray(response.data)) {
                    setRawMaterials(response.data);
                }
            } catch (error) {
                console.error('Error al obtener los materiales:', error);
            }
        };

        fetchRawMaterials();
    }, [navigate]);

    const fetchMaterialUsages = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return navigate('/login-personal');

        try {
            const response = await getMaterialUsagesByUserId(userId);
            const usages = response.data;
            if (Array.isArray(usages)) {
                setMaterialUsages(usages);
            }
        } catch (error) {
            console.error('Error al obtener los usos de materiales:', error);
        }
    };

    useEffect(() => {
        fetchMaterialUsages();
    }, [navigate]);

    useEffect(() => {
        const filtered = materialUsages.filter((usage) => isSameMonth(usage.createdAt, selectedMonth));
        setFilteredUsages(filtered);
        const total = filtered.reduce((sum, usage) => sum + (usage.totalCost || 0), 0);
        setTotalCost(total);
    }, [materialUsages, selectedMonth]);

    const getMaterialDescription = (rawMaterialId) => {
        const material = rawMaterials.find((m) => m.id === rawMaterialId);
        return material ? material.materialDescription : 'Materia desconocida';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        if (!userId || !selectedMaterialId || !quantityUsed || !description) {
            setErrorMessage('Por favor, completa todos los campos.');
            return;
        }

        const usageData = {
            materialId: selectedMaterialId,
            userId,
            description,
            quantity: parseFloat(quantityUsed),
        };

        try {
            const data = await createMaterialUsage(usageData);
            if (data.usage) {
                setSuccessMessage(data.message);
                setErrorMessage('');
                setSelectedMaterialId('');
                setQuantityUsed('');
                setDescription('');
                closeForm();
                await fetchMaterialUsages();
            } else {
                setErrorMessage(data.error || 'Error al registrar el consumo.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error al registrar el consumo:', error);
            setErrorMessage('Error al registrar el consumo.');
            setSuccessMessage('');
        }
    };

    const columns = [
        {
            name: 'Materia Prima',
            selector: row => getMaterialDescription(row.rawMaterialId),
            grow: 1,
        },
        {
            name: 'Cantidad Usada',
            selector: row => row.quantityUsed,
            grow: 1,
        },
        {
            name: 'Descripción',
            cell: row => (
                <div>
                    {row.usedInOrder && (
                        <span style={{ backgroundColor: '#ccc', color: '#333', padding: '2px 6px', borderRadius: '5px', fontSize: '12px', marginRight: '5px' }}>Usado en pedido</span>
                    )}
                    {row.usageDescription}
                </div>
            ),
            grow: 2,
        },
        {
            name: 'Fecha',
            selector: row => row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Sin fecha',
            grow: 2,
        },
    ];

    const conditionalRowStyles = [
        {
            when: row => row.usedInOrder,
            style: {
                opacity: 0.5,
                backgroundColor: '#f0f0f0',
                cursor: 'not-allowed',
            },
        },
    ];



    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', width: '100vw', height: '100vh' }}>
            <div style={{ backgroundColor: 'white', position: 'fixed', top: 30, display: 'flex', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100vw', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '80%', marginBottom: '30px' }}>
                    <img src={logo} alt="Logo" style={{ width: '90px' }} />
                    {Object.keys(paths).map((text, index) => (
                        <span
                            key={index}
                            style={{ cursor: 'pointer', padding: '10px 20px', fontSize: '16px', color: location.pathname === paths[text] ? '#000' : '#888', borderBottom: location.pathname === paths[text] ? '4px solid #30437A' : '2px solid transparent', transition: 'border-color 0.3s' }}
                            onClick={() => handleNavigation(text)}
                        >
                            {text}
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
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
                <Divider style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '80%', marginTop: '220px' }}>
                <div style={{ marginRight: '40px', flexDirection: 'column' }}>
                    <div style={{ backgroundColor: '#30437A', color: 'white', width: '200px', height: '140px', marginBottom: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '20px', boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>REGISTROS</span>
                            <GiPayMoney style={{ fontSize: '40px' }} />
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalCost}</span>
                        <span style={{ fontSize: '16px', color: '#B0B0B0' }}>Historial de uso</span>
                    </div>
                    <div style={{ cursor: 'pointer', border: '1px solid #30437A', width: '200px', height: '140px', borderRadius: '8px', display: 'flex', flexDirection: 'column', fontSize: '20px', color: 'black', boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)', justifyContent: 'center', alignItems: 'center' }} onClick={openForm}>
                        <MdOutlineAddToPhotos style={{ fontSize: '35px', color: '#30437A' }} />
                        <span style={{ fontSize: '20px', marginTop: '10px' }}>REGISTRAR CONSUMO</span>
                    </div>
                </div>
                <div style={{ width: '60vw' }}>
                    <DataTable
                        columns={columns}
                        data={filteredUsages}
                        pagination
                        conditionalRowStyles={conditionalRowStyles}
                        noDataComponent="No hay registros aún."
                    />
                </div>
            </div>

            <Modal open={open} onClose={closeForm}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '8px' }}>
                    <form onSubmit={handleSubmit}>
                        <h2 style={{ color: '#30437A' }}>Registrar Consumo</h2>
                        <select
                            value={selectedMaterialId}
                            onChange={(e) => setSelectedMaterialId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#f0f0f0', border: 'none' }}
                        >
                            <option value="">Selecciona una materia prima</option>
                            {rawMaterials.map((material) => (
                                <option key={material.id} value={material.id}>
                                    {material.materialDescription} - Cantidad: {material.quantity}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Cantidad usada"
                            value={quantityUsed}
                            onChange={(e) => setQuantityUsed(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#f0f0f0', border: 'none' }}
                        />
                        <input
                            type="text"
                            placeholder="Descripción"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#f0f0f0', border: 'none' }}
                        />
                        <Divider style={{ margin: '20px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={closeForm} style={{ marginRight: '10px' }}>Cancelar</button>
                            <button type="submit">Registrar</button>
                        </div>
                    </form>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                </Box>
            </Modal>
        </div>
    );
}
