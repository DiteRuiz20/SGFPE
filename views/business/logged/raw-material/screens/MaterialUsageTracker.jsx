import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from '@react-native-community/datetimepicker';
import { getRawMaterialsByUser, getMaterialUsagesByUserId, createMaterialUsage } from '../../../../../src/api/axios';
import MonthSelector from '../../../../MonthSelector';

export default function MaterialUsageTracker() {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [usages, setUsages] = useState([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [quantityUsed, setQuantityUsed] = useState('');
    const [description, setDescription] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const filtered = usages.filter((u) => {
            const date = new Date(u.createdAt);
            return (
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
            );
        });

        const total = filtered.reduce((acc, item) => acc + (item.totalCost || 0), 0);
        setTotalCost(total);
    }, [usages, selectedDate]);

    const fetchInitialData = async () => {
        const userId = await AsyncStorage.getItem('userId');
        try {
            const rawRes = await getRawMaterialsByUser(userId);
            setRawMaterials(rawRes.data);

            const usageRes = await getMaterialUsagesByUserId(userId);
            setUsages(usageRes.data);
        } catch (error) {
            console.error('Error inicial:', error);
        }
    };

    const filterUsagesByMonth = () => {
        const filtered = usages.filter((u) => {
            const date = new Date(u.createdAt);
            return date.getMonth() === selectedMonth.getMonth() && date.getFullYear() === selectedMonth.getFullYear();
        });
        const total = filtered.reduce((acc, item) => acc + (item.totalCost || 0), 0);
        setTotalCost(total);
    };

    const handleSubmit = async () => {
        const userId = await AsyncStorage.getItem('userId');

        if (!selectedMaterialId || !quantityUsed || !description) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        try {
            const data = await createMaterialUsage({
                materialId: selectedMaterialId,
                userId,
                quantity: parseFloat(quantityUsed),
                description
            });

            if (data.usage) {
                Alert.alert('Éxito', 'Insumo registrado correctamente');
                setModalVisible(false);
                setSelectedMaterialId('');
                setQuantityUsed('');
                setDescription('');
                fetchInitialData();
            } else {
                Alert.alert('Error', data.error || 'Ocurrió un error al registrar');
            }
        } catch (error) {
            console.error('Error registrando:', error);
            Alert.alert('Error', 'No se pudo registrar el consumo');
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.item, item.usedInOrder && styles.usedItem]}>
            <Text style={styles.label}>{getMaterialName(item.rawMaterialId)}</Text>
            <Text>Cantidad: {item.quantityUsed}</Text>
            <Text>Descripción: {item.usageDescription}</Text>
            <Text>Fecha: {new Date(item.createdAt).toLocaleString()}</Text>
        </View>
    );

    const getMaterialName = (id) => {
        const material = rawMaterials.find(m => m.id === id);
        return material ? material.materialDescription : 'Desconocido';
    };

    return (
        <View style={styles.container}>
            <View>
                <MonthSelector
                    selectedMonth={selectedDate}
                    onSelectMonth={(date) => setSelectedDate(date)}
                />
                <Text style={styles.title}>Gasto en materiales: ${totalCost.toFixed(2)}</Text>

                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>Registrar Insumo</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={usages.filter((u) => {
                    const date = new Date(u.createdAt);
                    return (
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getFullYear() === selectedDate.getFullYear()
                    );
                })}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No hay registros este mes</Text>}
            />

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nuevo Consumo</Text>

                        <Text style={styles.label}>Materia Prima</Text>
                        <View style={styles.selectBox}>
                            {rawMaterials.map((mat) => (
                                <TouchableOpacity
                                    key={mat.id}
                                    style={selectedMaterialId === mat.id ? styles.selectedItem : styles.selectItem}
                                    onPress={() => setSelectedMaterialId(mat.id)}
                                >
                                    <Text>{mat.materialDescription} - Qty: {mat.quantity}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            placeholder="Cantidad usada"
                            value={quantityUsed}
                            keyboardType="numeric"
                            onChangeText={setQuantityUsed}
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Descripción"
                            value={description}
                            onChangeText={setDescription}
                            style={styles.input}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                                <Text style={styles.submitText}>Registrar</Text>
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
        flex: 1,
        padding: 20,
        backgroundColor: '#f3f3f3',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#30437A',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    item: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    usedItem: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        width: '85%',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        paddingVertical: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        padding: 10,
    },
    cancelText: {
        color: '#999',
    },
    submitButton: {
        backgroundColor: '#30437A',
        padding: 10,
        borderRadius: 5,
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
    },
    selectBox: {
        marginBottom: 15,
        maxHeight: 150,
    },
    selectItem: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    selectedItem: {
        padding: 10,
        backgroundColor: '#e0e0ff',
        borderBottomColor: '#aaa',
        borderBottomWidth: 1,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
});
