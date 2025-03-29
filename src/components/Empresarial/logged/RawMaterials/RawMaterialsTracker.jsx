import React, { useState, useEffect } from 'react';
import { getRawMaterialsByUser, uploadRawMaterial } from '../../../../services/RawMaterialService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import logo from '../../../../assets/logo.png';

export default function RawMaterialsTracker() {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const openForm = () => setOpenUploadModal(true);
    const closeForm = () => setOpenUploadModal(false);

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
            } else {
                console.warn('La respuesta no es un array:', materials);
            }
        } catch (error) {
            console.error('Error al obtener los materiales:', error);
        }
    };

    useEffect(() => {
        fetchRawMaterials();
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
            fetchRawMaterials();
        } catch (error) {
            console.error('Error al subir el archivo:', error);
        }
    };

    const columns = [
        {
            selector: row => (<strong>{row.materialDescription}</strong>),
            name: 'Descripción',
            grow: 1,
        },
        {
            selector: row => row.quantity,
            name: 'Cantidad',
            grow: 1,
        },
        {
            selector: row => `$${row.unitPrice}`,
            name: 'Precio Unitario',
            grow: 1,
        },
    ];

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
            transition: 'border-color 0.3s',
        }),
        divider: {
            width: '100%',
            height: 2,
            backgroundColor: '#EAEAEA',
            marginTop: 20,
        },
        bodyContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            width: '80%',
            marginTop: '180px',
        },
        cardContainer: {
            marginRight: '40px',
            flexDirection: 'column',
        },
        card: {
            backgroundColor: '#30437A',
            color: 'white',
            width: '200px',
            height: '140px',
            marginBottom: '20px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '20px',
            boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)',
            padding: '20px',
            justifyContent: 'space-between',
        },
        cardText: {
            fontSize: '20px',
            fontWeight: 'bold',
        },
        cardSubtitle: {
            fontSize: '16px',
            color: '#B0B0B0',
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
        button: {
            fontSize: '35px',
            color: '#30437A',
        },
        buttonText: {
            fontSize: '20px',
            marginTop: '10px',
        },
        tableContainer: {
            width: '60vw',
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

    const paths = {
        'MATERIA PRIMA': '/raw-materials-tracker',
        'PEDIDOS': '/raw-material-order',
        'INSUMOS': '/material-usage-tracker',
    };

    const handleNavigation = (text) => {
        navigate(paths[text] || '/raw-material-tracker');
    };

    return (
        <div style={styles.container}>
            {/* Header con navegación */}
            <div style={styles.header}>
                <div style={styles.menu}>
                    <img src={logo} alt="Logo" style={{ width: '90px' }} />
                    {['MATERIA PRIMA', 'INSUMOS', 'PEDIDOS'].map((text, index) => (
                        <span
                            key={index}
                            style={styles.navLink(paths[text])}
                            onClick={() => handleNavigation(text)}
                        >
                            {text}
                        </span>
                    ))}
                </div>
                <Divider style={styles.divider} />
            </div>

            {/* Cuerpo principal */}
            <div style={styles.bodyContainer}>
                <div style={styles.cardContainer}>
                    <div style={styles.card}>
                        <span style={styles.cardText}>{rawMaterials.length}</span>
                        <span style={styles.cardSubtitle}>Materiales registrados</span>
                    </div>

                    <div style={styles.addButton} onClick={openForm}>
                        <MdOutlineAddToPhotos style={styles.button} />
                        <span style={styles.buttonText}>SUBIR MATERIAL</span>
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <DataTable
                        columns={columns}
                        data={rawMaterials}
                        pagination
                        noDataComponent="No hay materiales disponibles."
                    />
                </div>
            </div>

            {/* Modal de subida */}
            <Modal open={openUploadModal} onClose={closeForm}>
                <Box sx={styles.modalStyle}>
                    <form onSubmit={handleUpload}>
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: 28, fontWeight: 'bold', color: '#30437A' }}>Subir archivo Excel</span>
                        </div>
                        <input type="file" accept=".xlsx" onChange={handleFileChange} required style={styles.input} />
                        <Divider style={{ margin: '20px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={closeForm} style={{ marginRight: '10px' }}>Cancelar</button>
                            <button type="submit">Subir</button>
                        </div>
                    </form>
                </Box>
            </Modal>
        </div>
    );
}
