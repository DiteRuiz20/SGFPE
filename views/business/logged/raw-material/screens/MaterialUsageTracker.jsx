import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from '@react-native-community/datetimepicker';
import { getRawMaterialsByUser, getMaterialUsagesByUserId, createMaterialUsage } from '../../../../../src/api/axios';
import MonthSelector from '../../../../MonthSelector';
import { Input } from '@rneui/base';
import { validateField } from '../../../../InputValidator';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Button } from 'react-native-paper';

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
    const [formErrors, setFormErrors] = useState({});
    const [unitMenuVisible, setUnitMenuVisible] = useState(false);
    const [selectedMaterialQty, setSelectedMaterialQty] = useState(0);
    const [selectedMaterialName, setSelectedMaterialName] = useState('');
    const isFocused = useIsFocused();

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

    useEffect(() => {
        if (isFocused) {
            fetchInitialData();
        }
    }, [isFocused]);

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

        const quantityValidation = validateField('positiveInteger', quantityUsed);
        const descriptionValidation = validateField('nameOrDescription', description);

        const errors = {};
        if (!quantityValidation.valid) errors.quantityUsed = quantityValidation.message;
        if (!descriptionValidation.valid) errors.description = descriptionValidation.message;
        if (!selectedMaterialId) errors.material = 'Selecciona una materia prima';

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

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
            </View>

            <View style={styles.summaryCard}>
                <View>
                    <Text style={styles.cardTitle}>Gasto en materiales:</Text>
                    <Text style={styles.cardAmount}>${totalCost.toFixed(2)}</Text>
                </View>
                <View style={{ marginRight: 25 }}>
                    <Icon name="hand-holding-usd" size={40} color="#fff" />
                </View>
            </View>
            
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Icon name="plus" size={20} color="#30437A" style={{ marginRight: 10 }} />
                <Text style={styles.addButtonText}>Nuevo insumo</Text>
            </TouchableOpacity>


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

                        <TouchableOpacity
                            onPress={() => setUnitMenuVisible(!unitMenuVisible)}
                            style={styles.selectButton}
                        >
                            <Text style={styles.selectButtonText}>
                                {selectedMaterialName || 'Selecciona una materia prima'}
                            </Text>
                        </TouchableOpacity>

                        {unitMenuVisible && (
                            <View style={styles.menuBox}>
                                {rawMaterials.length === 0 ? (
                                    <View style={styles.selectItem}>
                                        <Text style={{ color: '#999' }}>No hay materia prima disponible</Text>
                                    </View>
                                ) : (
                                    rawMaterials.map((mat) => (
                                        <TouchableOpacity
                                            key={mat.id}
                                            style={styles.selectItem}
                                            onPress={() => {
                                                setSelectedMaterialId(mat.id);
                                                setSelectedMaterialName(mat.materialDescription);
                                                setSelectedMaterialQty(parseFloat(mat.quantity));
                                                setUnitMenuVisible(false);
                                                setFormErrors(prev => ({ ...prev, material: null }));
                                            }}
                                        >
                                            <Text>{mat.materialDescription} - Qty: {mat.quantity}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        )}

                        {formErrors.material && (
                            <Text style={{ color: 'red', marginTop: 4 }}>{formErrors.material}</Text>
                        )}

                        <Input
                            label="Cantidad usada"
                            placeholder="Cantidad"
                            keyboardType="numeric"
                            onChange={({ nativeEvent: { text } }) => {
                                setQuantityUsed(text);
                                const result = validateField('positiveInteger', text);
                                if (!result.valid) {
                                    setFormErrors(prev => ({ ...prev, quantityUsed: result.message }));
                                } else if (parseFloat(text) > selectedMaterialQty) {
                                    setFormErrors(prev => ({ ...prev, quantityUsed: 'La cantidad excede lo disponible' }));
                                } else {
                                    setFormErrors(prev => ({ ...prev, quantityUsed: null }));
                                }
                            }}
                            errorMessage={formErrors.quantityUsed}
                        />

                        <Input
                            label="Descripción"
                            placeholder="Descripción del uso"
                            onChange={({ nativeEvent: { text } }) => {
                                setDescription(text);
                                const result = validateField('nameOrDescription', text);
                                setFormErrors(prev => ({ ...prev, description: result.valid ? null : result.message }));
                            }}
                            errorMessage={formErrors.description}
                        />

                        <View style={styles.modalButtons}>
                            <Button style={styles.primary_button} mode="contained" onPress={() => setModalVisible(false)}>Cancelar</Button>
                            <Button style={styles.secondary_button} mode="contained" onPress={handleSubmit}>Guardar</Button>
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
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#30437A', marginBottom: 20, textAlign: 'left' },
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
    menuBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        maxHeight: 150,
    },
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
