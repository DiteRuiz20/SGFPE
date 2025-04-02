import React, { useState, useEffect } from 'react';
import { getRawMaterialsByUser, uploadRawMaterial } from '../../../../services/RawMaterialService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import { GiTakeMyMoney } from "react-icons/gi";

export default function RawMaterialsTracker() {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({
        center: new Date(),
        offset: 3, // Mostrará 5 meses (2 antes, 2 después, y el actual)
    });

    const isSameMonth = (date1, date2) => {
        return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    };

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
            height: '2px',
            backgroundColor: '#999',
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
            backgroundColor: '#B1B1B1',
            color: 'white',
            width: '200px',
            height: '140px',
            margin: '20px 30px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '20px',
            boxShadow:'0px 8px 5px rgba(48, 67, 122, 0.2)',
          },
          cardText: {
            fontSize: '20px',
            marginTop: '-10px',
            alignSelf: 'center',
            fontWeight: 'bold',
          },
          cardSubtitle: {
            fontSize: '16px',
            alignSelf: 'center',
            marginTop: '10px',
            color: 'white',
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

    return (
        <div>
          <div className="row justify-content-center">
            <TopNavBar/>
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
              dateWindow={dateWindow}
              setDateWindow={setDateWindow}
            />
            <Divider style={styles.divider} />
          </div>
    
          <div className='row mt-3'>
            <div className='col-sm-4 d-flex flex-column justify-content-center align-items-center'>
                <div style={styles.card}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
                <text>DEUDAS</text>
                <GiTakeMyMoney style={{ fontSize: '220%'}} />
                </div>
                    <text style={styles.cardText}>{rawMaterials.length}</text>
                    <text style={styles.cardSubtitle}>Materiales registrados</text>
                
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
