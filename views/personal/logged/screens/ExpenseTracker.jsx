import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getPersonalExpensesByUserId, getAllCategories, createPersonalExpense } from '../../../../src/api/axios';
import { DataTable, Portal, Modal, Button, HelperText, List, TouchableRipple } from 'react-native-paper';
import MonthSelector from '../../../MonthSelector';
import { validateField } from '../../../InputValidator';
import { Input } from '@rneui/base';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function ExpenseTracker() {
    const { userId } = useAuth();
    const monthScrollRef = useRef(null);

    const [personalExpenses, setPersonalExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [totalAmount, setTotalAmount] = useState(0);
    const [months, setMonths] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [formErrors, setFormErrors] = useState({ description: '', amount: '', category: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const isSameMonth = (date1, date2) =>
        date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

    const fetchData = async () => {
        if (!userId) return;
        try {
            const [expensesData, categoriesData] = await Promise.all([
                getPersonalExpensesByUserId(userId),
                getAllCategories()
            ]);
            const expenses = Array.isArray(expensesData) ? expensesData.map(exp => ({
                ...exp,
                categoryName: exp.categoryName || 'Sin categoría'
            })) : [];
            setPersonalExpenses(expenses);
            setCategories(categoriesData || []);
        } catch (err) {
            console.error('Error en fetchData:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        generateMonths(new Date());
    }, [userId]);

    useEffect(() => {
        const filtered = personalExpenses.filter(exp => isSameMonth(new Date(exp.date), selectedDate));
        setFilteredExpenses(filtered);
        const total = filtered.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        setTotalAmount(total);
    }, [personalExpenses, selectedDate]);

    const generateMonths = (centerDate) => {
        const generatedMonths = Array.from({ length: 6 }, (_, i) => {
            const date = new Date(centerDate);
            date.setMonth(centerDate.getMonth() - 2 + i);
            return {
                label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                date
            };
        });
        setMonths(generatedMonths);

        setTimeout(() => {
            monthScrollRef.current?.scrollTo({ x: 140, animated: true });
        }, 50);
    };

    const handleCreateExpense = async () => {
        const descValidation = validateField('nameOrDescription', description);
        const amountValidation = validateField('positiveNumber', amount);

        const errors = {};
        if (!descValidation.valid) errors.description = descValidation.message;
        if (!amountValidation.valid) errors.amount = amountValidation.message;
        if (!selectedCategory) errors.category = 'Selecciona una categoría';

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await createPersonalExpense({
                description,
                amount: parseFloat(amount),
                categoryId: selectedCategory.id,
                userId
            });
            closeModal();
            fetchData();
        } catch (err) {
            console.error(err);
            setError('Error creating expense.');
        }
    };

    const openModal = () => {
        setModalVisible(true);
        setError('');
    };

    const closeModal = () => {
        setModalVisible(false);
        setDescription('');
        setAmount('');
        setSelectedCategory(null);
        setFormErrors({ description: '', amount: '', category: '' });
        setError('');
    };

    if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <View style={styles.container}>
            
            <View>
                <MonthSelector
                    selectedMonth={selectedDate}
                    onSelectMonth={(date) => setSelectedDate(date)}
                />

            </View>
            <ScrollView>
                <View style={styles.summaryCard}>
                    <View>
                        <Text style={styles.summaryLabel}>Gastos</Text>
                        <Text style={styles.summaryCantidad}>${totalAmount.toFixed(2)}</Text>
                        <Text style={styles.summarySubtext}>Gastos de este mes</Text>
                    </View>
                    <View style={{ marginRight: 25 }}>
                        <Icon name="money-bill-alt" size={40} color="#fff" />
                    </View>
                </View>
            

            <TouchableOpacity style={styles.addButton} onPress={openModal}>
                <Icon name="plus" size={20} color="#30437A" style={{ marginRight: 10 }} />
                <Text style={styles.addButtonText}>Nuevo gasto</Text>
            </TouchableOpacity>

            <Portal>
                <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>Nuevo gasto</Text>

                    <Input
                        label="Descripción"
                        placeholder="Ingresa la descripción"
                        onChange={({ nativeEvent: { text } }) => {
                            setDescription(text);
                            const result = validateField('nameOrDescription', text);
                            setFormErrors(prev => ({ ...prev, description: result.valid ? null : result.message }));
                        }}
                        errorMessage={formErrors.description}
                    />

                    <Input
                        label="Cantidad"
                        placeholder="Monto del gasto"
                        onChange={({ nativeEvent: { text } }) => {
                            setAmount(text);
                            const result = validateField('positiveNumber', text);
                            setFormErrors(prev => ({ ...prev, amount: result.valid ? null : result.message }));
                        }}
                        keyboardType="numeric"
                        errorMessage={formErrors.amount}
                    />

                    <TouchableRipple onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                        <View style={styles.categorySelector}>
                            <Text>{selectedCategory ? selectedCategory.name : 'Selecciona una categoría'}</Text>
                        </View>
                    </TouchableRipple>
                    {formErrors.category && <HelperText type="error">{formErrors.category}</HelperText>}

                    {showCategoryDropdown && (
                        <View style={styles.categoryDropdown}>
                            <ScrollView>
                            {categories.map(category => (
                                <List.Item
                                    key={category.id}
                                    title={category.name}
                                    onPress={() => {
                                        setSelectedCategory(category);
                                        setShowCategoryDropdown(false);
                                        setFormErrors(prev => ({ ...prev, category: null }));
                                    }}
                                />
                            ))}
                            </ScrollView>
                        </View>
                    )}

                    {error ? <HelperText type="error">{error}</HelperText> : null}

                    <View style={styles.modalButtons}>
                        <Button style={styles.primary_button} mode="contained" onPress={closeModal}>Cancelar</Button>
                        <Button style={styles.secondary_button} mode="contained" onPress={handleCreateExpense}>Guardar</Button>
                    </View>
                </Modal>
            </Portal>

            <View style={styles.tableContainer}>
                <DataTable>
                    <DataTable.Header style={styles.tableHeader}>
                        <DataTable.Title textStyle={styles.tableHeaderText}>Descripción</DataTable.Title>
                        <DataTable.Title textStyle={styles.tableHeaderText}>Cantidad</DataTable.Title>
                        <DataTable.Title textStyle={styles.tableHeaderText}>Categoría</DataTable.Title>
                        <DataTable.Title textStyle={styles.tableHeaderText}>Fecha</DataTable.Title>
                    </DataTable.Header>

                    <View>
                        {filteredExpenses.length === 0 && (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text>No hay gastos registrados para este mes.</Text>
                            </View>
                        )}
                        {filteredExpenses.map((exp, idx) => (
                            <DataTable.Row key={exp.id || idx} style={styles.tableRow}>
                                <DataTable.Cell textStyle={styles.tableCell}>{exp.description}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.tableCell}>${exp.amount}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.tableCell}>{exp.categoryName}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.tableCell}>{new Date(exp.date).toLocaleDateString()}</DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </View>
                </DataTable>
            </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
    monthTabs: { flexDirection: 'row', marginBottom: 20 },
    monthItem: { marginHorizontal: 16, fontSize: 16, color: '#666' },
    activeMonth: { color: '#41416e', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#00C897' },
    summaryCard: {
        backgroundColor: '#30437A', borderRadius: 16, padding: 24, marginBottom: 5,
        elevation: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#30387a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
    summaryLabel: { color: '#fff', fontSize: 20, marginBottom: 8 },
    summaryCantidad: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
    summarySubtext: { color: '#eee', fontSize: 16 },
    modal: { backgroundColor: '#fff', padding: 24, marginHorizontal: 16, borderRadius: 16, elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#30437A', marginBottom: 20, textAlign: 'left' },
    input: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
    categorySelector: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 16, marginBottom: 16, backgroundColor: '#fff' },
    categoryDropdown: { maxHeight: 200, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', marginBottom: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    tableContainer: { borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 30 },
    tableHeader: { backgroundColor: '#f1f3f5' },
    tableHeaderText: { fontWeight: 'bold', color: '#41416e' },
    tableRow: { borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
    tableCell: { color: '#495057', fontSize: 14 },
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
    addButton: {
        marginVertical: 20, backgroundColor: 'white', borderColor: '#30437A', borderWidth: 1,
        borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height: 50,
        shadowColor: '#30387a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
});
