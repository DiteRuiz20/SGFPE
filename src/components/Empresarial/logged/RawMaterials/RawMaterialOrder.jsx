import React, { useState, useEffect } from 'react';
import { getAvailableMaterialsByUserId } from '../../../../services/MaterialUsageService';
import { createRawMaterialOrder } from '../../../../services/Order';
import { useNavigate } from 'react-router-dom';

const RawMaterialOrder = () => {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [materialUsageIds, setMaterialUsageIds] = useState([]); // solo este
    const [income, setIncome] = useState('');
    const [orderDescription, setOrderDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMaterialsUsage = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    navigate('/login-personal');
                    return;
                }

                const response = await getAvailableMaterialsByUserId(userId);
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

        fetchMaterialsUsage();
    }, [navigate]);

    const handleMultiSelectChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setMaterialUsageIds(selectedOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        if (!userId || materialUsageIds.length === 0 || !income || !orderDescription) {
            setErrorMessage('Por favor, completa todos los campos.');
            return;
        }

        const orderData = {
            userId,
            materialUsageIds,
            income: parseFloat(income),
            orderDescription,
        };

        try {
            const response = await createRawMaterialOrder(orderData);
            setSuccessMessage('Pedido creado exitosamente ✅');
            setErrorMessage('');
            setIncome('');
            setOrderDescription('');
            setMaterialUsageIds([]); // limpiamos selección
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            setErrorMessage('Hubo un error al crear el pedido');
            setSuccessMessage('');
        }
    };

    return (
        <div>
            <h2>Crear Pedido</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="orderDescription">Descripción del pedido:</label>
                    <input
                        type="text"
                        id="orderDescription"
                        value={orderDescription}
                        onChange={(e) => setOrderDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="materialUsageIds">Seleccionar insumos:</label>
                    <select
                        id="materialUsageIds"
                        multiple
                        value={materialUsageIds}
                        onChange={handleMultiSelectChange}
                        required
                    >
                        {rawMaterials.map((material) => (
                            <option key={material.id} value={material.id}>
                                {material.usageDescription} - {material.quantityUsed} unidades
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="income">Ingreso del pedido ($):</label>
                    <input
                        type="number"
                        id="income"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Crear Pedido</button>
            </form>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
};

export default RawMaterialOrder;
