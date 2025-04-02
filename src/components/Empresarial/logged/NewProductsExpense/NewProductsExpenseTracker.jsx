import React, { useState, useEffect } from 'react';
import { uploadNewProductExpenses, getNewProductExpensesByUser } from '../../../../services/NewProductService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Box, Divider } from '@mui/material';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import { GiTakeMyMoney } from "react-icons/gi";

export default function NewProductExpenseTracker() {
    const [products, setProducts] = useState([]);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });

    const openForm = () => setOpenUploadModal(true);
    const closeForm = () => setOpenUploadModal(false);

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
        /* mismos estilos que ya tienes en RawMaterialsTracker... */
    };

    return (
        <div>
            <TopNavBar />
            <MonthSelector
                selectedMonth={selectedMonth}
                onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
                dateWindow={dateWindow}
                setDateWindow={setDateWindow}
            />
            <Divider style={styles.divider} />
            <div className='row mt-3'>
                <div className='col-sm-4 d-flex flex-column justify-content-center align-items-center'>
                    <div style={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px' }}>
                            <text>MERCANCÍA</text>
                            <GiTakeMyMoney style={{ fontSize: '220%' }} />
                        </div>
                        <text style={styles.cardText}>{products.length}</text>
                        <text style={styles.cardSubtitle}>Productos cargados</text>
                    </div>
                    <div style={styles.addButton} onClick={openForm}>
                        <MdOutlineAddToPhotos style={styles.button} />
                        <span style={styles.buttonText}>SUBIR EXCEL</span>
                    </div>
                </div>

                <div style={styles.tableContainer}>
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
