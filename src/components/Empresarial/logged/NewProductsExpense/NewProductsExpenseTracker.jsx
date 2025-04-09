import React, { useState, useEffect } from 'react';
import { uploadNewProductExpenses, createNewProductExpense, getNewProductExpensesByUser } from '../../../../services/NewProductService';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import { BiStore } from "react-icons/bi";
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
  unitCost: yup
    .number()
    .typeError('El precio unitario debe ser un número')
    .positive('El precio unitario debe ser mayor a 0')
    .test(
      'is-valid-decimal',
      'Debe contener hasta 2 decimales',
      value => /^\d+(\.\d{1,2})?$/.test(value?.toString())
    )
    .required('El precio unitario es obligatorio'),
  category: yup.string().required('La categoría es obligatoria').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  paymentMethod: yup.string().required('El método de pago es obligatorio'),
});

export default function NewProductExpenseTracker() {
  const [products, setProducts] = useState([]);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openManualModal, setOpenManualModal] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
  const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-MX', options);
  };

  const fetchProducts = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return navigate('/login-personal');
    try {
      const response = await getNewProductExpensesByUser(userId);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedMonth]);

  const isSameMonth = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
  };

  const filteredProducts = products.filter(p => isSameMonth(p.purchaseDate, selectedMonth));

  const isCurrentMonth = () => {
    const currentMonth = new Date();
    return selectedMonth.getFullYear() === currentMonth.getFullYear() && selectedMonth.getMonth() === currentMonth.getMonth();
  };

  const isDisabled = !isCurrentMonth();

  const openForm = () => {
    setFileError('');
    setAlert({ open: true, message: 'El uso de la plantilla es esencial para la lectura', severity: 'info' });
    setOpenUploadModal(true);
  };
  const closeForm = () => {
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
      await uploadNewProductExpenses(file, userId);
      closeForm();
      fetchProducts();
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setFileError('Error al subir el archivo. Verifica el formato o la plantilla.');
    }
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const handleManualSubmit = async (data) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return navigate('/login-personal');

      const newProduct = {
        userId,
        productDescription: data.description,
        quantity: parseInt(data.quantity),
        unitCost: parseFloat(data.unitCost),
        category: data.category,
        paymentMethod: data.paymentMethod,
        productObservations: data.productObservations,
        totalCost: (parseInt(data.quantity) * parseFloat(data.unitCost)).toFixed(2),
        purchaseDate: new Date().toISOString(),
      };

      await createNewProductExpense(newProduct);
      closeManualForm();
      fetchProducts();
    } catch (error) {
      console.error('Error al registrar producto manualmente:', error);
    }
  };

  const columns = [
    { selector: row => row.productDescription, name: 'Descripción', grow: 1 },
    { selector: row => row.quantity, name: 'Cantidad', grow: 1 },
    { selector: row => `$${row.unitCost}`, name: 'Costo Unitario', grow: 1 },
    { selector: row => `$${row.totalCost}`, name: 'Costo Total', grow: 1 },
    { selector: row => row.category, name: 'Categoría', grow: 1 },
    { selector: row => row.paymentMethod, name: 'Método de Pago', grow: 1 },
    { selector: row => formatDate(row.purchaseDate), name: 'Fecha de compra', grow: 1 },
  ];

  filteredProducts.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

  const totalMonthlyCost = filteredProducts.reduce((sum, p) => sum + (parseFloat(p.totalCost) || 0), 0);

  const styles = {
    divider: {
      width: '100%',
      height: '2px',
      backgroundColor: '#999',
      marginTop: 20,
    },
    card: {
      backgroundColor: '#30437A',
      color: 'white',
      width: '200px',
      height: '140px',
      margin: '20px 30px',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '20px',
      boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)',
    },
    button: {
      alignSelf: 'flex-end',
      margin: '15px',
      fontSize: '35px',
      color: '#30437A',
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
      border: '1px solid #30437A',
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
      boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)',
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
      color: '#30437A',
    },
    alert: {
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translate(-50%, 0)'
    }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px' }}>
              <text>MERCANCÍA</text>
              <BiStore style={{ fontSize: '160%' }} />
            </div>
            <text style={styles.cardText}>${totalMonthlyCost.toFixed(2)}</text>
            <text style={styles.cardSubtitle}>Gasto del mes</text>
          </div>

          <button style={styles.addButton} onClick={() => !isDisabled && openForm()} disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>SUBIR ARCHIVO</text>
          </button>

          <button style={styles.addButton} onClick={() => !isDisabled && openManualForm()} disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center', textAlign: 'center', marginTop: '-10px' }}>NUEVA MERCANCÍA</text>
          </button>
        </div>

        <div className='col-9 flex-column justify-content-center align-items-center' style={{ overflowX: 'auto', padding: '20px', boxSizing: 'border-box' }}>
          <DataTable
            columns={columns}
            data={filteredProducts}
            pagination
            noDataComponent="No hay productos disponibles en este mes."
            customStyles={customStyles}
          />
        </div>
      </div>

      {/* Modal subir archivo */}
      <Modal open={openUploadModal} onClose={closeForm}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '8px' }}>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: '#30437A' }}>Subir archivo Excel</span>
            </div>
            <input className='input col-12' type="file" accept=".xlsx" onChange={handleFileChange} />
            {fileError && <span style={{ color: 'red', fontSize: '14px' }}>{fileError}</span>}
            <Divider style={{ width: '100%', height: '2px', backgroundColor: '#999', marginTop: 20 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' }}>
              <button type="button" className="primary_button" style={{ flex: 1, fontSize: '14px' }} onClick={() => {
                const link = document.createElement('a');
                link.href = '/plantilla_mercancia.xlsx';
                link.download = 'plantilla_mercancia.xlsx';
                link.click();
              }}>Descargar plantilla</button>
              <button type="submit" className="secondary_button" style={{ flex: 1 }}>Subir</button>
            </div>
          </form>
        </Box>
      </Modal>

      {/* Modal manual */}
      <Modal open={openManualModal} onClose={closeManualForm}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleSubmit(handleManualSubmit)}>
            <div style={{ marginBottom: '20px' }}>
              <text style={styles.title}>Nueva mercancía</text>
            </div>

            <input type="text" placeholder='Descripción' {...register('description')} className='input col-12 mb-2' />
            {errors.description && <span style={{ color: 'red' }}>{errors.description.message}</span>}
            <input type="number" placeholder='Cantidad' {...register('quantity')} className='input col-12 mb-2' />
            {errors.quantity && <span style={{ color: 'red' }}>{errors.quantity.message}</span>}
            <input type="number" step="0.01" placeholder='Precio Unitario' {...register('unitCost')} className='input col-12 mb-2' />
            {errors.unitCost && <span style={{ color: 'red' }}>{errors.unitCost.message}</span>}
            <input type="text" placeholder='Categoría' {...register('category')} className='input col-12 mb-2' />
            {errors.category && <span style={{ color: 'red' }}>{errors.category.message}</span>}

            <select
              className='input col-12'
              {...register('paymentMethod')}
            >
              <option value="">Selecciona método de pago</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </select>
            {errors.paymentMethod && <p style={{ color: 'red' }}>{errors.paymentMethod.message}</p>}

            <Divider style={styles.divider} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button type="button" className='primary_button' onClick={closeManualForm} style={{ width: '40%' }}>Cancelar</button>
              <button type="submit" className='secondary_button' style={{ width: '40%' }}>Subir</button>
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
