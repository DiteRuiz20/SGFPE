import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Modal, Portal, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../../../../../src/auth/AuthContext';
import { createRawMaterial, getRawMaterialsByUser } from '../../../../../src/api/axios';
import { DataTable } from 'react-native-paper';

export default function RawMaterialTracker() {
    const { userId } = useAuth();
    const monthScrollRef = useRef(null);

    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [months, setMonths] = useState([]);
    const [totalCost, setTotalCost] = useState(0);

    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({
        materialDescription: '',
        quantity: '',
        unitPrice: '',
        supplier: '',
        measurementUnit: '',
        notes: '',
    });
    const [error, setError] = useState('');

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

    const handleSelectMonth = (date) => {
        setSelectedDate(date);
        generateMonths(date);
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCreate = async () => {
        const { materialDescription, quantity, unitPrice, supplier, measurementUnit } = form;
        if (!materialDescription || !quantity || !unitPrice || !supplier || !measurementUnit) {
            return setError('Por favor llena todos los campos obligatorios.');
        }
        try {
            await createRawMaterial({
                ...form,
                quantity: parseFloat(quantity),
                unitPrice: parseFloat(unitPrice),
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
        setForm({ materialDescription: '', quantity: '', unitPrice: '', supplier: '', measurementUnit: '', notes: '' });
        setError('');
    };

    return (
        <View style={styles.container}>
            <View>
            <ScrollView
                ref={monthScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.monthTabs}>
                {months.map((month, index) => (
                    <TouchableOpacity key={index} onPress={() => handleSelectMonth(new Date(month.date))}>
                        <Text style={[
                            styles.monthItem,
                            isSameMonth(selectedDate, new Date(month.date)) && styles.activeMonth
                        ]}>
                            {month.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryAmount}>${totalCost.toFixed(2)}</Text>
                <Text style={styles.summarySubtext}>Gasto mensual</Text>
            </View>
            </View>

            <Button mode="contained" onPress={() => setModalVisible(true)} style={styles.addButton}>Registrar materia</Button>

            <Portal>
                <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>Nueva materia prima</Text>

                    <TextInput label="Descripción" value={form.materialDescription} onChangeText={text => handleChange('materialDescription', text)} style={styles.input} />
                    <TextInput label="Cantidad" value={form.quantity} onChangeText={text => handleChange('quantity', text)} keyboardType="numeric" style={styles.input} />
                    <TextInput label="Precio Unitario" value={form.unitPrice} onChangeText={text => handleChange('unitPrice', text)} keyboardType="numeric" style={styles.input} />
                    <TextInput label="Proveedor" value={form.supplier} onChangeText={text => handleChange('supplier', text)} style={styles.input} />
                    <TextInput label="Unidad de medida" value={form.measurementUnit} onChangeText={text => handleChange('measurementUnit', text)} style={styles.input} />
                    <TextInput label="Notas" value={form.notes} onChangeText={text => handleChange('notes', text)} style={styles.input} multiline />

                    {error ? <HelperText type="error">{error}</HelperText> : null}

                    <View style={styles.modalButtons}>
                        <Button onPress={closeModal}>Cancelar</Button>
                        <Button mode="contained" onPress={handleCreate}>Guardar</Button>
                    </View>
                </Modal>
            </Portal>

            {/* Tabla */}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },

    monthTabs: { flexDirection: 'row', marginBottom: 20 },
    monthItem: { marginHorizontal: 16, fontSize: 16, color: '#666' },
    activeMonth: { color: '#41416e', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#00C897' },

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
    input: {
        marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 1
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
});
