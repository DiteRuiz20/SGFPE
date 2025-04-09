import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DataTable, Modal, Portal, Button, HelperText, Menu } from 'react-native-paper';
import { Input } from '@rneui/base';
import { useAuth } from '../../../../../src/auth/AuthContext';
import { createRawMaterial, getRawMaterialsByUser } from '../../../../../src/api/axios';
import MonthSelector from '../../../../MonthSelector';
import { validateField } from '../../../../InputValidator';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function RawMaterialTracker() {
    const { userId } = useAuth();
    const monthScrollRef = useRef(null);

    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [months, setMonths] = useState([]);
    const [totalCost, setTotalCost] = useState(0);

    const [modalVisible, setModalVisible] = useState(false);
    const [materialDescription, setMaterialDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [supplier, setSupplier] = useState('');
    const [measurementUnit, setMeasurementUnit] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [error, setError] = useState('');
    const isFocused = useIsFocused();

    const [unitMenuVisible, setUnitMenuVisible] = useState(false);
    const [unitAnchor, setUnitAnchor] = useState(null);
    const measurementUnits = ['cm', 'mm', 'm', 'mg', 'g', 'kg', 'ml', 'L', 'Pieza', 'Caja', 'Paquete', 'Unidad', 'Par'];

    const isSameMonth = (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getUTCMonth() === d2.getUTCMonth() && d1.getUTCFullYear() === d2.getUTCFullYear();
    };

    const fetchMaterials = async () => {
        if (!userId) return;
        try {
            const res = await getRawMaterialsByUser(userId);
            const data = Array.isArray(res.data) ? res.data : [];
            setMaterials(data);
        } catch (err) {
            console.error('Error al obtener materiales:', err);
        }
    };

    useEffect(() => {
        fetchMaterials();
        generateMonths(new Date());
    }, [userId]);

    useEffect(() => {
        if (isFocused) {
            fetchMaterials();
        }
    }, [isFocused]);

    useEffect(() => {
        const filtered = materials.filter(m => isSameMonth(m.entryDate, selectedDate));
        setFilteredMaterials(filtered);
        const total = filtered.reduce((sum, m) => sum + (parseFloat(m.quantity) * parseFloat(m.unitPrice)), 0);
        setTotalCost(total);
    }, [materials, selectedDate]);

    const generateMonths = (centerDate) => {
        const generated = Array.from({ length: 6 }, (_, i) => {
            const date = new Date(centerDate);
            date.setMonth(centerDate.getMonth() - 2 + i);
            return {
                label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                date
            };
        });
        setMonths(generated);
        setTimeout(() => {
            monthScrollRef.current?.scrollTo({ x: 140, animated: true });
        }, 50);
    };

    const handleCreate = async () => {
        const errors = {};
        const descriptionVal = validateField('nameOrDescription', materialDescription);
        const quantityVal = validateField('positiveInteger', quantity);
        const priceVal = validateField('positiveNumber', unitPrice);
        const supplierVal = validateField('nameOrDescription', supplier);
        const unitVal = validateField('nameOrDescription', measurementUnit);

        if (!descriptionVal.valid) errors.materialDescription = descriptionVal.message;
        if (!quantityVal.valid) errors.quantity = quantityVal.message;
        if (!priceVal.valid) errors.unitPrice = priceVal.message;
        if (!supplierVal.valid) errors.supplier = supplierVal.message;
        if (!unitVal.valid) errors.measurementUnit = unitVal.message;

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await createRawMaterial({
                materialDescription,
                quantity: parseFloat(quantity),
                unitPrice: parseFloat(unitPrice),
                supplier,
                measurementUnit,
                entryDate: new Date().toISOString(),
                userId
            });
            closeModal();
            fetchMaterials();
        } catch (err) {
            console.error('Error al crear materia prima:', err);
            setError('Error al crear materia prima.');
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setMaterialDescription('');
        setQuantity('');
        setUnitPrice('');
        setSupplier('');
        setMeasurementUnit('');
        setFormErrors({});
        setError('');
    };

    return (
        <View style={styles.container}>

            <View>
                <MonthSelector selectedMonth={selectedDate} onSelectMonth={setSelectedDate} />
            </View>
            <ScrollView>

            <View style={styles.summaryCard}>
                <View>
                    <Text style={styles.cardTitle}>Total:</Text>
                    <Text style={styles.cardAmount}>${totalCost.toFixed(2)}</Text>
                </View>
                <View style={{ marginRight: 25 }}>
                    <Icon name="hand-holding-usd" size={40} color="#fff" />
                </View>
                </View>
                        
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Icon name="plus" size={20} color="#30437A" style={{ marginRight: 10 }} />
                    <Text style={styles.addButtonText}>Nueva materia</Text>
                </TouchableOpacity>

            <Portal>
                <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>Nueva materia prima</Text>

                    <Input
                        label="Descripción"
                        placeholder="Descripción del material"
                        onChange={({ nativeEvent: { text } }) => {
                            setMaterialDescription(text);
                            const result = validateField('nameOrDescription', text);
                            setFormErrors(prev => ({ ...prev, materialDescription: result.valid ? null : result.message }));
                        }}
                        errorMessage={formErrors.materialDescription}
                    />

                    <Input
                        label="Cantidad"
                        placeholder="Cantidad"
                        keyboardType="numeric"
                        onChange={({ nativeEvent: { text } }) => {
                            setQuantity(text);
                            const result = validateField('positiveInteger', text);
                            setFormErrors(prev => ({ ...prev, quantity: result.valid ? null : result.message }));
                        }}
                        errorMessage={formErrors.quantity}
                    />

                    <Input
                        label="Precio Unitario"
                        placeholder="Precio por unidad"
                        keyboardType="numeric"
                        onChange={({ nativeEvent: { text } }) => {
                            setUnitPrice(text);
                            const result = validateField('positiveNumber', text);
                            setFormErrors(prev => ({ ...prev, unitPrice: result.valid ? null : result.message }));
                        }}
                        errorMessage={formErrors.unitPrice}
                    />

                    <Input
                        label="Proveedor"
                        placeholder="Nombre del proveedor"
                        onChange={({ nativeEvent: { text } }) => {
                            setSupplier(text);
                            const result = validateField('nameOrDescription', text);
                            setFormErrors(prev => ({ ...prev, supplier: result.valid ? null : result.message }));
                        }}
                        errorMessage={formErrors.supplier}
                    />

                    <View>
                        <TouchableOpacity
                            onPress={(e) => {
                                setUnitAnchor(e.nativeEvent.target);
                                setUnitMenuVisible(true);
                            }}
                            style={styles.selectButton}
                        >
                            <Text style={styles.selectButtonText}>
                                {measurementUnit || 'Selecciona unidad de medida'}
                            </Text>
                        </TouchableOpacity>

                        <Menu
                            visible={unitMenuVisible}
                            onDismiss={() => setUnitMenuVisible(false)}
                            anchor={{ x: 0, y: 0 }} // required dummy anchor
                        >
                            {measurementUnits.map((unit) => (
                                <Menu.Item
                                    key={unit}
                                    title={unit}
                                    onPress={() => {
                                        setMeasurementUnit(unit);
                                        setUnitMenuVisible(false);
                                        const result = validateField('nameOrDescription', unit);
                                        setFormErrors(prev => ({ ...prev, measurementUnit: result.valid ? null : result.message }));
                                    }}
                                />
                            ))}
                        </Menu>

                        {formErrors.measurementUnit && (
                            <HelperText type="error" visible>
                                {formErrors.measurementUnit}
                            </HelperText>
                        )}
                    </View>

                    {!!error && <HelperText type="error">{error}</HelperText>}

                    <View style={styles.modalButtons}>
                        <Button style={styles.primary_button} mode="contained" onPress={closeModal}>Cancelar</Button>
                        <Button style={styles.secondary_button} mode="contained" onPress={handleCreate}>Guardar</Button>
                    </View>
                </Modal>
            </Portal>

            {filteredMaterials.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No hay materias primas registradas este mes
                    </Text>
                </View>
            ) : (
                <View style={styles.tableContainer}>
                    <DataTable>
                        <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title textStyle={styles.tableHeaderText}>Descripción</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.tableHeaderText}>Cantidad</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.tableHeaderText}>Precio</DataTable.Title>
                        </DataTable.Header>

                        <ScrollView>
                            {filteredMaterials.map((m, idx) => (
                                <DataTable.Row key={m._id || idx} style={styles.tableRow}>
                                    <DataTable.Cell textStyle={styles.tableCell}>{m.materialDescription}</DataTable.Cell>
                                    <DataTable.Cell numeric textStyle={styles.tableCell}>{m.quantity}</DataTable.Cell>
                                    <DataTable.Cell numeric textStyle={styles.tableCell}>${m.unitPrice}</DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </ScrollView>
                    </DataTable>
                </View>
            )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
    summaryCard: {
        backgroundColor: '#41416e', borderRadius: 16, padding: 24, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4
    },
    summaryLabel: { color: '#fff', fontSize: 18, marginBottom: 6 },
    summaryAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    summarySubtext: { color: '#ddd', fontSize: 14 },
    addButton: {
        marginVertical: 20, backgroundColor: '#00C897', borderRadius: 12, paddingVertical: 10
    },
    modal: {
        backgroundColor: '#fff', padding: 24, marginHorizontal: 16, borderRadius: 16, elevation: 5
    },
    modalTitle: {
        fontSize: 22, fontWeight: 'bold', color: '#41416e', marginBottom: 20, textAlign: 'center'
    },
    modalButtons: {
        flexDirection: 'row', justifyContent: 'space-between', marginTop: 20
    },
    tableContainer: {
        borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 30
    },
    tableHeader: {
        backgroundColor: '#f1f3f5'
    },
    tableHeaderText: {
        fontWeight: 'bold', color: '#41416e'
    },
    tableRow: {
        borderBottomWidth: 1, borderBottomColor: '#f1f3f5'
    },
    tableCell: {
        color: '#495057', fontSize: 14
    },
    selectButton: {
        backgroundColor: '#f1f3f5',
        padding: 14,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectButtonText: {
        color: '#495057',
        fontSize: 16,
    },
    emptyContainer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 12,
        textAlign: 'center',
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#30437A', marginBottom: 20, textAlign: 'left' },
    addButton: {
        marginVertical: 20, backgroundColor: 'white', borderColor: '#30437A', borderWidth: 1,
        borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height: 50,
        shadowColor: '#30387a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      addButtonText: { color: 'black', fontSize: 16 },
      primary_button: {
        width: '40%',
        backgroundColor: '#30437A',
        padding: 2,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#30387a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      secondary_button: {
        width: '40%',
        backgroundColor: '#3DC9A7',
        padding: 2,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#3dc1ad',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      summaryCard: {
        backgroundColor: '#30437A', borderRadius: 16, padding: 24, marginBottom: 5,
        elevation: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#30387a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      cardTitle: {
        color: 'white',
        fontSize: 16,
    },
    cardAmount: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
    },
});
