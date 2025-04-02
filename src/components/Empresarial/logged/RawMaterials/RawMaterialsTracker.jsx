import React, { useState, useEffect } from 'react';
import { getRawMaterialsByUser, uploadRawMaterial } from '../../../../services/RawMaterialService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import { TbWood } from "react-icons/tb";

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

    const isCurrentMonth = () => {
      const currentMonth = new Date();
      return selectedMonth.getFullYear() === currentMonth.getFullYear() && selectedMonth.getMonth() === currentMonth.getMonth();
    };
    
    const isDisabled = !isCurrentMonth();

    const openFileForm = () => setOpenUploadModal(true);
    const closeFileForm = () => setOpenUploadModal(false);

    const openManualForm = () => setOpenManualModal(true);
    const closeManualForm = () => setOpenManualModal(false);

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
            closeFileForm();
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
        divider: {
          width: '100%',
          height: '2px',
          backgroundColor: '#999',
          marginTop: 20,
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
          boxShadow:'0px 8px 5px rgba(136, 136, 136, 0.2)',
        },
        button: {
          alignSelf: 'flex-end',
          margin: '15px',
          fontSize: '35px',
          color: '#B1B1B1',
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
          border: '1px solid #B1B1B1',
          backgroundColor: 'white',
          width: '200px',
          height: '140px',
          margin: '20px 30px',
          borderRadius: '8px',
          display: 'flex',
          padding: '10px',
          flexDirection: 'column',
          fontSize: '20px',
          color: 'black',
          boxShadow:'0px 8px 5px rgba(136, 136, 136, 0.2)',
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
          color: '#B1B1B1',
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
          <div className='col-sm-3 d-flex flex-column justify-content-center align-items-center'>
            <div style={styles.card}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
                <text>MATERIA</text>
                <TbWood style={{ fontSize: '180%'}} />
              </div>
              <text style={styles.cardText}>{rawMaterials.length}</text>
              <text style={styles.cardSubtitle}>Materiales registrados</text>
            </div>

            <div
              style={styles.addButton}
              onClick={() => !isDisabled && openFileForm()}
              disabled={isDisabled}>
              <MdOutlineAddToPhotos style={styles.button} />
              <text style={{alignSelf: 'center'}}>SUBIR ARCHIVO</text>
            </div>

            <div
              style={styles.addButton}
              onClick={() => !isDisabled && openManualForm()}
              disabled={isDisabled}>
              <MdOutlineAddToPhotos style={styles.button} />
              <text style={{alignSelf: 'center'}}>NUEVA MATERIA</text>
            </div>
          </div>

          <div className='col-9 flex-column justify-content-center align-items-center' style={{ overflowX: 'auto', padding: '20px', boxSizing: 'border-box' }}>
            <DataTable
              columns={columns}
              data={rawMaterials}
              pagination
              noDataComponent="No hay materiales disponibles."
            />
          </div>
        </div>

        {/* Modal de subida de archivo */}
        <Modal open={openUploadModal} onClose={closeFileForm}>
          <Box sx={styles.modalStyle}>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '20px' }}>
                <text style={styles.title}>Subir archivo Excel</text>
              </div>
              <input type="file" accept=".xlsx" onChange={handleFileChange} required className='input col-12' />
                <Divider style={styles.divider} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button type="button" className='primary_button' style={{ width: '40%'}} onClick={closeFileForm}>Cancelar</button>
                  <button type="submit" className='secondary_button' style={{ width: '40%' }}>Subir</button>
                </div>
            </form>
                </Box>
            </Modal>
        </div>
    );
}
