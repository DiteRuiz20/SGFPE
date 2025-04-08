import React, { useState, useEffect } from 'react';
import { getRawMaterialsByUser } from '../../../../services/RawMaterialService';
import { createMaterialUsage, getMaterialUsagesByUserId } from '../../../../services/MaterialUsageService';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { Modal, Box, Divider } from '@mui/material';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import { TbCheckupList } from 'react-icons/tb';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';


const regexLettersSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

const schema = yup.object().shape({
  description: yup
    .string()
    .required('La descripción es obligatoria')
    .matches(regexLettersSpaces, 'Solo se permiten letras, espacios y acentos'),

  quantityUsed: yup
    .number()
    .typeError('La cantidad debe ser un número')
    .positive('La cantidad debe ser mayor a 0')
    .required('La cantidad es obligatoria')
    .test(
      'max-stock',
      'La cantidad usada no puede ser mayor',
      function (value) {
        const { selectedMaterialId } = this.parent;
        const rawMaterials = this.options.context?.rawMaterials || [];
        const selected = rawMaterials.find(m => m.id === selectedMaterialId);
        return !selected || value <= selected.quantity;
      }
    ),

  selectedMaterialId: yup
    .string()
    .required('La materia prima es obligatoria'),
});

export default function MaterialUsageTracker() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [materialUsages, setMaterialUsages] = useState([]);
  const [filteredUsages, setFilteredUsages] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantityUsed, setQuantityUsed] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [open, setIsOpen] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [newInsumo, setNewInsumo] = useState({
    description: '',
    quantity: '',
    materialId: '',
  });

  const navigate = useNavigate();
  const location = useLocation();

  const openForm = () => {
    reset(); // limpiar campos del modal
    setIsOpen(true);
  };

  const closeForm = () => {
    reset(); // limpiar si se cierra
    setIsOpen(false);
  };

  const isCurrentMonth = () => {
    const currentMonth = new Date();
    return selectedMonth.getFullYear() === currentMonth.getFullYear() && selectedMonth.getMonth() === currentMonth.getMonth();
  };

  const isDisabled = !isCurrentMonth();

  const isSameMonth = (date1, date2) => {
    return (
      new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
      new Date(date1).getMonth() === new Date(date2).getMonth()
    );
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

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    context: { rawMaterials },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        navigate('/login-personal');
        return;
      }

      const usageData = {
        ...newInsumo,
        userId: userId,
        description: data.description,
        materialId: data.selectedMaterialId,
        quantity: parseFloat(data.quantityUsed),
        date: new Date().toISOString()
      };

      const response = await createMaterialUsage(usageData);

      await fetchMaterialUsages();

      setSelectedMaterialId('');
      setQuantityUsed('');
      setDescription('');
      closeForm();

    } catch (error) {
      setErrorMessage('Error al registrar el insumo.');
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
      selector: row =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).replace(' de ', ' de ').replace(',', '')
            .replace(/(\d+) de (\w+) de (\d+)/, '$1 de $2 del $3')
          : 'Sin fecha',
      grow: 2,
    },
  ];

  filteredUsages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      boxShadow: '0px 8px 5px rgba(48, 55, 122, 0.2)'
    },
    button: {
      alignSelf: 'flex-end',
      margin: '10px',
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
      padding: '10px',
      borderRadius: '8px',
      display: 'flex',
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
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '15px' }}>
              <text>INSUMOS</text>
              <TbCheckupList style={{ fontSize: '180%' }} />
            </div>

            <text style={styles.cardText}>${totalCost}</text>
            <text style={styles.cardSubtitle}>Gasto en materiales</text>
          </div>

          <button
            style={styles.addButton}
            onClick={() => !isDisabled && openForm()}
            disabled={isDisabled}>
            <MdOutlineAddToPhotos style={styles.button} />
            <text style={{ alignSelf: 'center' }}>NUEVO INSUMO</text>
          </button>
        </div>

        <div className='col-sm-8 flex-column justify-content-center align-items-center'>
          <DataTable
            columns={columns}
            data={filteredUsages}
            pagination
            conditionalRowStyles={conditionalRowStyles}
            noDataComponent="No hay registros aún."
            customStyles={customStyles}
          />
        </div>
      </div>

      <Modal open={open} onClose={closeForm}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '20px' }}>
              <text style={styles.title}>Registrar Insumo</text>
            </div>
            <select className='input col-12'
              {...register('selectedMaterialId')}
            >
              <option
                value="">Selecciona una materia prima</option>
              {rawMaterials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.materialDescription} - Cantidad: {material.quantity}
                </option>
              ))}
            </select>
            {errors.selectedMaterialId && <p style={{ color: 'red' }}>{errors.selectedMaterialId.message}</p>}

            <input className='input col-12'
              type="number"
              placeholder="Cantidad usada"
              {...register('quantityUsed')}
            />
            {errors.quantityUsed && <p style={{ color: 'red' }}>{errors.quantityUsed.message}</p>}

            <input className='input col-12'
              type="text"
              placeholder="Descripción"
              {...register('description')}
            />
            {errors.description && <p style={{ color: 'red' }}>{errors.description.message}</p>}

            <Divider style={styles.divider} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button type="button" className='primary_button' styles={{ width: '40%' }} onClick={closeForm} style={{ marginRight: '10px' }}>Cancelar</button>
              <button type="submit" className='secondary_button' styles={{ width: '40%' }}>Registrar</button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
