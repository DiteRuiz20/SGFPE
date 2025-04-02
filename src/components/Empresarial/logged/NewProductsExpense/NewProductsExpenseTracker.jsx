import React, { useState, useEffect } from 'react';
import { uploadNewProductExpenses, getNewProductExpensesByUser } from '../../../../services/NewProductService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import { BiStore } from "react-icons/bi";

export default function NewProductExpenseTracker() {
    const [products, setProducts] = useState([]);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [openManualModal, setOpenManualModal] = useState(false);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });

    const openForm = () => setOpenUploadModal(true);
    const closeForm = () => setOpenUploadModal(false);

    const openManualForm = () => setOpenManualModal(true);
    const closeManualForm = () => setOpenManualModal(false);

    const isCurrentMonth = () => {
        const currentMonth = new Date();
        return selectedMonth.getFullYear() === currentMonth.getFullYear() && selectedMonth.getMonth() === currentMonth.getMonth();
    };
      
    const isDisabled = !isCurrentMonth();

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
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId || !file) return navigate('/login-personal');

        try {
            await uploadNewProductExpenses(file, userId);
            closeForm();
            fetchProducts();
        } catch (error) {
            console.error('Error al subir el archivo:', error);
        }
    };

    const columns = [
        {
            selector: row => (<strong>{row.productDescription}</strong>),
            name: 'Descripción',
            grow: 1,
        },
        {
            selector: row => row.quantity,
            name: 'Cantidad',
            grow: 1,
        },
        {
            selector: row => `$${row.unitCost}`,
            name: 'Costo Unitario',
            grow: 1,
        },
        {
            selector: row => `$${row.totalCost}`,
            name: 'Costo Total',
            grow: 1,
        },
        {
            selector: row => row.category,
            name: 'Categoría',
            grow: 1,
        }
    ];

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
          boxShadow:'0px 8px 5px rgba(48, 55, 122, 0.2)',
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
          boxShadow:'0px 8px 5px rgba(48, 55, 122, 0.2)',
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

              <text style={styles.cardText}>{products.length}</text>
              <text style={styles.cardSubtitle}>Productos cargados</text>
            </div>

            <button
              style={styles.addButton}
              onClick={() => !isDisabled && openForm()}
              disabled={isDisabled}>
              <MdOutlineAddToPhotos style={styles.button} />
              <text style={{ alignSelf: 'center' }}>SUBIR ARCHIVO</text>
            </button>

            <button
              style={styles.addButton}
              onClick={() => !isDisabled && openManualForm()}
              disabled={isDisabled}>
              <MdOutlineAddToPhotos style={styles.button} />
              <text style={{alignSelf: 'center', textAlign: 'center', marginTop: '-10px'}}>NUEVA MERCANCÍA</text>
            </button>
          </div>

          <div className='col-9 flex-column justify-content-center align-items-center' style={{ overflowX: 'auto', padding: '20px', boxSizing: 'border-box' }}>
            <DataTable
              columns={columns}
              data={products}
              pagination
              noDataComponent="No hay productos disponibles."
            />
          </div>
        </div>

        <Modal open={openUploadModal} onClose={closeForm}>
          <Box sx={styles.modalStyle}>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '20px' }}>
                <text style={styles.title}>Subir archivo Excel</text>
              </div>

              <input className='input col-12' type="file" accept=".xlsx" onChange={handleFileChange} required style={styles.input} />
              
              <Divider style={styles.divider} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button type="button" className='primary_button' onClick={closeForm} style={{ width: '40%' }}>Cancelar</button>
                <button type="submit" className='secondary_button' style={{ width: '40%' }}>Subir</button>
              </div>
            </form>
          </Box>
        </Modal>

        <Modal open={openManualModal} onClose={closeManualForm}>
          <Box sx={styles.modalStyle}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <text style={styles.title}>Nueva mercancía</text>
              </div>

              <div>
                <input className='input col-12'
                  placeholder='Descripción'
                  type="text"
                  name="productDescription"
                  required
                />
              </div>

              <div>
                <input className='input col-12'
                  placeholder='Cantidad adquirida'
                  type="number"
                  name="quantity"
                  required
                />
              </div>

              <div>
                <input className='input col-12'
                  placeholder='Costo unitario'
                  type="number"
                  name="unitCost"
                  required
                />
              </div>

              <div>
                <input className='input col-12'
                  placeholder='Costo total'
                  type="number"
                  name="totalCost"
                  required
                />
              </div>

              <div>
                <input className='input col-12'
                  placeholder='Categoría'
                  type="text"
                  name="category"
                />
              </div>

              <div> {/* INPUT PARA EL METODO DE PAGO */}
                <select className='input col-12'
                  name="paymentMethodId"
                  required
                >
                  {/*<option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}*/}
                </select>
              </div>

              <div>
                <input className='input col-12'
                  placeholder='Observaciones'
                  type="text"
                  name="productObservations"
                />
              </div>
              
              <Divider style={styles.divider} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button type="button" className='primary_button' onClick={closeManualForm} style={{ width: '40%' }}>Cancelar</button>
                <button type="submit" className='secondary_button' style={{ width: '40%' }}>Subir</button>
              </div>
            </form>
          </Box>
        </Modal>
      </div>
    );
}
