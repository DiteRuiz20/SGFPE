import React, { useState, useEffect } from 'react';
import { getRawMaterialsByUser, uploadRawMaterial } from '../../../../services/RawMaterialService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { GiPayMoney } from 'react-icons/gi';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import logo from '../../../../assets/logo.png';
import MaterialUsageTracker from './MaterialUsageTracker';

const RawMaterialsTracker = () => {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [totalMaterials, setTotalMaterials] = useState(0);
    const [open, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [openUsageModal, setOpenUsageModal] = useState(false);
    const navigate = useNavigate();

    const openForm = () => setIsOpen(true);
    const closeForm = () => setIsOpen(false);
    const openUsageForm = () => setOpenUsageModal(true);
    const closeUsageForm = () => setOpenUsageModal(false);

    // Definir la función fetchRawMaterials fuera del useEffect
    const fetchRawMaterials = async () => {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            navigate('/login-personal');
            return;
        }

        try {
            const response = await getRawMaterialsByUser(userId);
            const materials = response.data;
            if (Array.isArray(materials)) {
                setRawMaterials(materials);
                setFilteredMaterials(materials);
                setTotalMaterials(materials.length); // Suponiendo que cada material cuenta como uno
            } else {
                console.warn('La respuesta no es un array:', materials);
            }
        } catch (error) {
            console.error('Error al obtener los materiales:', error);
        }
    };

    useEffect(() => {
        fetchRawMaterials(); // Llamar a la función al montar el componente
    }, [navigate]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        if (!userId || !file) {
            navigate('/login-personal');
            return;
        }

        try {
            await uploadRawMaterial(file, userId);
            closeForm();
            // Recargar los materiales después de la carga
            fetchRawMaterials(); // Ahora esta función está definida
        } catch (error) {
            console.error('Error al subir el archivo:', error);
        }
    };

    const columns = [
        {
            selector: row => row.materialDescription,
            name: 'Descripción',
            grow: 1,
        },
        {
            selector: row => row.quantity,
            name: 'Cantidad',
            grow: 1,
        },
        {
            selector: row => row.unitPrice,
            name: 'Precio Unitario',
            grow: 1,
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', width: '100vw', height: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '80%', marginTop: '50px' }}>
                <img src={logo} alt="Logo" style={{ width: '90px' }} />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ cursor: 'pointer', border: '1px solid #30437A', padding: '10px', borderRadius: '5px' }} onClick={openForm}>
                        <MdOutlineAddToPhotos style={{ fontSize: '20px' }} />
                        <span>Añadir Material</span>
                    </div>
                    <div style={{ cursor: 'pointer', border: '1px solid #30437A', padding: '10px', borderRadius: '5px', marginLeft: '10px' }} onClick={openUsageForm}>
                        <span>Registrar Consumo</span>
                    </div>
                </div>
            </div>

            <Divider style={{ width: '100%', margin: '20px 0' }} />

            <DataTable
                columns={columns}
                data={filteredMaterials}
                pagination
                noDataComponent="No hay materiales disponibles."
            />

            {/* Modal para subir archivo */}
            <Modal open={open} onClose={closeForm}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '8px' }}>
                    <form onSubmit={handleUpload}>
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: 28, fontWeight: 'bold', color: '#30437A' }}>Subir Material</span>
                        </div>
                        <input type="file" accept=".xlsx" onChange={handleFileChange} required />
                        <Divider style={{ margin: '20px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'right', marginTop: '20px' }}>
                            <button type="button" onClick={closeForm} style={{ marginRight: '10px' }}>Cancelar</button>
                            <button type="submit">Subir</button>
                            <button onClick={() => navigate('/material-usage-tracker')}>
                                Ir a insumos
                            </button>
                            <button onClick={() => navigate('/raw-material-order')}>Ir a pedidos</button>
                        </div>
                    </form>
                </Box>
            </Modal>

            {/* Modal para el uso de materiales */}
            <Modal open={openUsageModal} onClose={closeUsageForm}>
                <Box sx={{ /* estilos del modal */ }}>
                    <MaterialUsageTracker />
                </Box>
            </Modal>
        </div>
    );
};

export default RawMaterialsTracker;