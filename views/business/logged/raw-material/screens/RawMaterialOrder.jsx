import React, { useEffect, useState } from 'react';
import {
    View, Text, Modal, FlatList,
    TouchableOpacity, Alert, StyleSheet, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MonthSelector from '../../../../MonthSelector';
import { getAvailableMaterialsByUserId, getOrdersByUserId, createRawMaterialOrder } from '../../../../../src/api/axios';
import { Input } from '@rneui/base';
import { validateField } from '../../../../InputValidator';
import { useIsFocused } from '@react-navigation/native';

export default function RawMaterialOrder() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [netProfit, setNetProfit] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [description, setDescription] = useState('');
    const [income, setIncome] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const isFocused = useIsFocused();

    const fetchOrders = async () => {
        const userId = await AsyncStorage.getItem('userId');
        try {
            const response = await getOrdersByUserId(userId);
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
        }
    };

    const fetchMaterials = async () => {
        const userId = await AsyncStorage.getItem('userId');
        try {
            const response = await getAvailableMaterialsByUserId(userId);
            setAvailableMaterials(response.data || []);
        } catch (error) {
            console.error('Error al obtener materiales disponibles:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchMaterials();
    }, []);

    useEffect(() => {
        const filtered = orders.filter((order) => {
            const date = new Date(order.createdAt);
            return (
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
            );
        });
        setFilteredOrders(filtered);
        const total = filtered.reduce((sum, o) => sum + (o.netProfit || 0), 0);
        setNetProfit(total);
    }, [orders, selectedDate]);

    useEffect(() => {
        if (isFocused) {
            fetchMaterials();
        }
    }, [isFocused]);

    const toggleMaterialSelection = (id) => {
        setSelectedMaterialIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        const userId = await AsyncStorage.getItem('userId');

        const descriptionValidation = validateField('nameOrDescription', description);
        const incomeValidation = validateField('positiveNumber', income);
        const errors = {};

        if (!descriptionValidation.valid) errors.description = descriptionValidation.message;
        if (!incomeValidation.valid) errors.income = incomeValidation.message;
        if (selectedMaterialIds.length === 0) errors.materials = 'Selecciona al menos un insumo';

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const orderData = {
            userId,
            materialUsageIds: selectedMaterialIds,
            income: parseFloat(income),
            orderDescription: description
        };

        try {
            await createRawMaterialOrder(orderData);
            Alert.alert('Éxito', 'Pedido creado correctamente');
            setDescription('');
            setIncome('');
            setSelectedMaterialIds([]);
            setModalVisible(false);
            fetchOrders();
        } catch (error) {
            console.error('Error al crear pedido:', error);
            Alert.alert('Error', 'No se pudo crear el pedido');
        }
    };

    return (
        <View style={styles.container}>
            <MonthSelector selectedMonth={selectedDate} onSelectMonth={setSelectedDate} />

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Ingreso mensual</Text>
                <Text style={styles.cardAmount}>${netProfit.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>+ Nuevo Pedido</Text>
            </TouchableOpacity>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.orderItem}>
                        <Text style={styles.orderTitle}>{item.orderDescription}</Text>
                        <Text>Ingreso: ${item.income}</Text>
                        <Text>{new Date(item.createdAt).toLocaleString()}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay pedidos este mes</Text>}
            />

            {/* MODAL */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nuevo Pedido</Text>

                        <Input
                            label="Descripción del pedido"
                            placeholder="Escribe una descripción"
                            onChange={({ nativeEvent: { text } }) => {
                                setDescription(text);
                                const result = validateField('nameOrDescription', text);
                                setFormErrors(prev => ({ ...prev, description: result.valid ? null : result.message }));
                            }}
                            errorMessage={formErrors.description}
                        />

                        <Input
                            label="Ingreso del pedido ($)"
                            placeholder="Ej: 1000"
                            keyboardType="numeric"
                            onChange={({ nativeEvent: { text } }) => {
                                setIncome(text);
                                const result = validateField('positiveNumber', text);
                                setFormErrors(prev => ({ ...prev, income: result.valid ? null : result.message }));
                            }}
                            errorMessage={formErrors.income}
                        />

                        <Text style={styles.label}>Selecciona los insumos:</Text>
                        <ScrollView style={{ maxHeight: 150 }}>
                            {availableMaterials.map((m) => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[
                                        styles.selectItem,
                                        selectedMaterialIds.includes(m.id) && styles.selectedItem
                                    ]}
                                    onPress={() => toggleMaterialSelection(m.id)}
                                >
                                    <Text>{m.usageDescription} - {m.quantityUsed} unidades</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {formErrors.materials && (
                            <Text style={{ color: 'red', marginTop: 4 }}>{formErrors.materials}</Text>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={{ color: '#999' }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
                                <Text style={{ color: 'white' }}>Registrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f4f4f4',
    },
    card: {
        backgroundColor: '#3DC9A7',
        borderRadius: 10,
        padding: 20,
        marginVertical: 15,
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
    button: {
        backgroundColor: '#3DC9A7',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    orderItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        width: '90%',
        padding: 20,
        borderRadius: 10
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    selectItem: {
        padding: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    selectedItem: {
        backgroundColor: '#d4f7ee',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        padding: 10,
    },
    saveButton: {
        backgroundColor: '#3DC9A7',
        padding: 10,
        borderRadius: 5,
    },
});
