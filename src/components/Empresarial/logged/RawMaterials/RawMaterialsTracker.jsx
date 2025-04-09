import React, { useState, useEffect } from 'react';
import { getRawMaterialsByUser, uploadRawMaterial, createRawMaterial } from '../../../../services/RawMaterialService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import { TbWood } from "react-icons/tb";
import { Alert, Snackbar } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';

const schema = yup.object().shape({
  description: yup.string().required('La descripción es obligatoria').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  quantity: yup
    .number()
    .typeError('La cantidad debe ser un número')
    .positive('La cantidad debe ser mayor a 0')
    .required('La cantidad es obligatoria'),
  unitPrice: yup
    .number()
    .typeError('El precio unitario debe ser un número')
    .positive('El precio unitario debe ser mayor a 0')
    .test(
      'is-valid-decimal',
      'Debe contener hasta 2 decimales',
      value => /^\d+(\.\d{1,2})?$/.test(value?.toString())
    )
    .required('El precio unitario es obligatorio'),
  supplier: yup.string().required('El proveedor es obligatorio').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  measurementUnit: yup.string().required('La unidad de medida es obligatoria'),
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('es-MX', options);
};

export default function RawMaterialsTracker() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openManualModal, setOpenManualModal] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
  const [manualForm, setManualForm] = useState({
    materialDescription: '',
    quantity: '',
    unitPrice: '',
    supplier: '',
    measurementUnit: '',
    notes: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });

  const measurementUnits = ['cm', 'mm', 'm', 'mg', 'g', 'kg', 'ml', 'L', 'Pieza', 'Caja', 'Rollo', 'Paquete', 'Bolsa', 'Docena', 'Unidad', 'Par', 'Set'];

  const isSameMonth = (date1, date2) => date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  const isCurrentMonth = () => {
    const currentMonth = new Date();
    return selectedMonth.getFullYear() === currentMonth.getFullYear() && selectedMonth.getMonth() === currentMonth.getMonth();
  };
  const isDisabled = !isCurrentMonth();

  const openFileForm = () => {
    setFileError('');
    setAlert({ open: true, message: 'El uso de la plantilla es esencial para la lectura', severity: 'info' });
    setOpenUploadModal(true);
  };
  const closeFileForm = () => {
    setFile(null);
    setFileError('');
    setOpenUploadModal(false);
  };

  const openManualForm = () => {
    reset();
    setOpenManualModal(true);
  };
  const closeManualForm = () => {
    reset();
    setOpenManualModal(false);
  };

  const fetchRawMaterials = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return navigate('/login-personal');

    try {
      const response = await getRawMaterialsByUser(userId);
      const materials = response.data;
      if (Array.isArray(materials)) {
        const filtered = materials.filter(material => {
          const materialDate = new Date(material.entryDate);
          return !isNaN(materialDate) && isSameMonth(materialDate, selectedMonth);
        });
        setRawMaterials(filtered);
        const totalCost = filtered.reduce((acc, material) => acc + (material.quantity * material.unitPrice), 0);
        setMonthlyTotal(totalCost);
      }
    } catch (error) {
      console.error('Error al obtener los materiales:', error);
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, [selectedMonth]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    if (!file) {
      setFileError('Debes seleccionar un archivo Excel.');
      return;
    }

    if (!userId) return navigate('/login-personal');

    try {
      await uploadRawMaterial(file, userId);
      closeFileForm();
      fetchRawMaterials();
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setFileError('Error al subir el archivo. Intenta nuevamente.');
    }
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return navigate('/login-personal');

      await createRawMaterial({
        ...manualForm,
        materialDescription: data.description,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        supplier: data.supplier,
        measurementUnit: data.measurementUnit,
        notes: data.notes,
        entryDate: new Date().toISOString(),
        userId
      });
      reset();
      setManualForm({ materialDescription: '', quantity: '', unitPrice: '', supplier: '', measurementUnit: '', notes: '' });
      closeManualForm();
      fetchRawMaterials();
    } catch (error) {
      console.error('Error al crear materia prima:', error);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/plantilla_materia_prima.xlsx';
    link.download = 'plantilla_materia_prima.xlsx';
    link.click();
  };

  const columns = [
    { selector: row => row.materialDescription, name: 'Descripción', grow: 1 },
    { selector: row => row.supplier, name: 'Proveedor', grow: 1 },
    { selector: row => row.quantity, name: 'Cantidad', grow: 1 },
    { selector: row => `$${row.unitPrice.toFixed(2)}`, name: 'Precio Unitario', grow: 1 },
    { selector: row => row.measurementUnit, name: 'Unidad de Medida', grow: 1 },
    { selector: row => formatDate(row.entryDate), name: 'Fecha de ingreso', grow: 1 },
  ];

  rawMaterials.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

  const styles = {
    divider: { width: '100%', height: '2px', backgroundColor: '#999', marginTop: 20 },
    card: {
      backgroundColor: '#B1B1B1', color: 'white', width: '200px', height: '140px',
      margin: '20px 30px', borderRadius: '8px', display: 'flex', flexDirection: 'column',
      fontSize: '20px', boxShadow: '0px 8px 5px rgba(136, 136, 136, 0.2)',
    },
    button: { alignSelf: 'flex-end', margin: '15px', fontSize: '35px', color: '#B1B1B1' },
    cardText: { fontSize: '20px', alignSelf: 'center', marginTop: '-10px', fontWeight: 'bold' },
    cardSubtitle: { fontSize: '16px', alignSelf: 'center', marginTop: '10px', color: 'white' },
    addButton: {
      border: '1px solid #B1B1B1', backgroundColor: 'white', width: '200px', height: '140px',
      margin: '20px 30px', borderRadius: '8px', display: 'flex', padding: '10px',
      flexDirection: 'column', fontSize: '20px', color: 'black',
      boxShadow: '0px 8px 5px rgba(136, 136, 136, 0.2)',
      opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer',
    },
    modalStyle: {
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '8px',
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#B1B1B1' },
    alert: { position: 'fixed', top: 20, left: '50%', transform: 'translate(-50%, 0)' }
  };

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
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }} >
              <text>MATERIA</text>
              <TbWood style={{ fontSize: '180%' }} />
            </div>
            <text style={styles.cardText}>${monthlyTotal.toFixed(2)}</text>
            <text style={styles.cardSubtitle}>Gasto en materiales</text>
          </div>

          <div style={styles.addButton} onClick={() => !isDisabled && openFileForm()} disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>SUBIR ARCHIVO</text>
          </div>

          <div style={styles.addButton} onClick={() => !isDisabled && openManualForm()} disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>NUEVA MATERIA</text>
          </div>
        </div>

        <div className='col-9 flex-column justify-content-center align-items-center' style={{ overflowX: 'auto', padding: '20px', boxSizing: 'border-box' }}>
          <DataTable
            columns={columns}
            data={rawMaterials}
            pagination
            noDataComponent="No hay materiales disponibles."
            customStyles={customStyles}
          />
        </div>
      </div>

      {/* Modal subir archivo */}
      <Modal open={openUploadModal} onClose={closeFileForm}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '20px' }}>
              <text style={styles.title}>Subir archivo Excel</text>
            </div>
            <input type="file" accept=".xlsx" onChange={handleFileChange} className='input col-12' />
            {fileError && <span style={{ color: 'red', fontSize: '14px' }}>{fileError}</span>}
            <Divider style={styles.divider} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px', flexWrap: 'nowrap' }}>
              <button type="button" className="primary_button" style={{ flex: 1, padding: '10px 20px', fontSize: '14px' }} onClick={downloadTemplate}>
                Descargar plantilla
              </button>
              <button type="submit" className="secondary_button" style={{ flex: 1, padding: '10px 20px' }}>Subir</button>
            </div>
          </form>
        </Box>
      </Modal>

      {/* Modal manual */}
      <Modal open={openManualModal} onClose={closeManualForm}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '20px' }}>
              <text style={styles.title}>Nueva materia prima</text>
            </div>
            <input type="text" placeholder='Descripción' {...register('description')} className='input col-12 mb-2' />
            {errors.description && <span style={{ color: 'red' }}>{errors.description.message}</span>}
            <input type="number" placeholder='Cantidad' {...register('quantity')} className='input col-12 mb-2' />
            {errors.quantity && <span style={{ color: 'red' }}>{errors.quantity.message}</span>}
            <input type="number" step="0.01" placeholder='Precio Unitario' {...register('unitPrice')} className='input col-12 mb-2' />
            {errors.unitPrice && <span style={{ color: 'red' }}>{errors.unitPrice.message}</span>}
            <input type="text" placeholder='Proveedor' {...register('supplier')} className='input col-12 mb-2' />
            {errors.supplier && <span style={{ color: 'red' }}>{errors.supplier.message}</span>}

            {/* Agregado select para la unidad de medida */}
            <select
              {...register('measurementUnit')}
              className='input col-12 mb-2'
            >
              <option value="">Seleccione unidad de medida</option>
              {measurementUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            {errors.measurementUnit && <span style={{ color: 'red' }}>{errors.measurementUnit.message}</span>}
            <Divider style={styles.divider} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button type="button" className='primary_button' onClick={closeManualForm}>Cancelar</button>
              <button type="submit" className='secondary_button'>Registrar</button>
            </div>
          </form>
        </Box>
      </Modal>

      <Snackbar open={alert.open} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert className='col-md-4 col-12' onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} style={styles.alert}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
