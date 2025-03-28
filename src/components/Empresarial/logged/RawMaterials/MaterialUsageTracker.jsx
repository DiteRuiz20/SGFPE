import React, { useState, useEffect } from 'react';
import { getRawMaterialsByUser } from '../../../../services/RawMaterialService';
import { createMaterialUsage } from '../../../../services/MaterialUsageService';
import { useNavigate } from 'react-router-dom';
import { Modal, Box, Divider } from '@mui/material';

const MaterialUsageTracker = () => {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [quantityUsed, setQuantityUsed] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
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

        fetchRawMaterials();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        if (!userId || !selectedMaterialId || !quantityUsed || !description) {
            setErrorMessage('Por favor, completa todos los campos.');
            return;
        }

        const usageData = {
            materialId: selectedMaterialId,
            userId,
            description,
            quantity: parseFloat(quantityUsed),
        };

        try {
            const data = await createMaterialUsage(usageData);

            if (data.usage) {
                setSuccessMessage(data.message);
                setErrorMessage('');
                // Limpiar el formulario
                setSelectedMaterialId('');
                setQuantityUsed('');
                setDescription('');
            } else {
                setErrorMessage(data.error || 'Error al registrar el consumo.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error al registrar el consumo:', error);
            setErrorMessage('Error al registrar el consumo.');
            setSuccessMessage('');
        }
    };

    return (
        <div>
            <h2>Registrar Consumo de Materia Prima</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="material">Materia Prima:</label>
                    <select
                        id="material"
                        value={selectedMaterialId}
                        onChange={(e) => setSelectedMaterialId(e.target.value)}
                        required
                    >
                        <option value="">Selecciona una materia prima</option>
                        {rawMaterials.map((material) => (
                            <option key={material.id} value={material.id}>
                                {material.materialDescription} - Cantidad disponible: {material.quantity}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="quantity">Cantidad Usada:</label>
                    <input
                        type="number"
                        id="quantity"
                        value={quantityUsed}
                        onChange={(e) => setQuantityUsed(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Descripción:</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Registrar Consumo</button>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
};

export default MaterialUsageTracker; 