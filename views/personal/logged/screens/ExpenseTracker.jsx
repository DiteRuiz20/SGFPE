import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getPersonalExpensesByUserId, getAllCategories, createPersonalExpense } from '../../../../src/api/axios';
import { DataTable, Portal, Modal, Button, HelperText, List, TouchableRipple } from 'react-native-paper';
import MonthSelector from '../../../MonthSelector';
import { validateField } from '../../../InputValidator';
import { Input } from '@rneui/base';

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

    return (
        <View style={styles.container}>
            <View>
                <MonthSelector
                    selectedMonth={selectedDate}
                    onSelectMonth={(date) => setSelectedDate(date)}
                />

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Spent</Text>
                    <Text style={styles.summaryAmount}>-${totalAmount.toFixed(2)}</Text>
                    <Text style={styles.summarySubtext}>Monthly Expense</Text>
                </View>
            </View>

            <Button mode="contained" onPress={openModal} style={styles.addButton}>Add Expense</Button>

            <Portal>
                <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>New Expense</Text>

                    <Input
                        label="Description"
                        placeholder="Enter description"
                        onChange={({ nativeEvent: { text } }) => {
                            setDescription(text);
                            const result = validateField('nameOrDescription', text);
                            setFormErrors(prev => ({ ...prev, description: result.valid ? null : result.message }));
                        }}
                        errorMessage={formErrors.description}
                    />

                    <Input
                        label="Amount"
                        placeholder="Enter amount"
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
                            <Text>{selectedCategory ? selectedCategory.name : 'Select Category'}</Text>
                        </View>
                    </TouchableRipple>
                    {formErrors.category && <HelperText type="error">{formErrors.category}</HelperText>}

                    {showCategoryDropdown && (
                        <View style={styles.categoryDropdown}>
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
                        </View>
                    )}

                    {error ? <HelperText type="error">{error}</HelperText> : null}

                    <View style={styles.modalButtons}>
                        <Button onPress={closeModal}>Cancel</Button>
                        <Button mode="contained" onPress={handleCreateExpense}>Save</Button>
                    </View>
                </Modal>
            </Portal>

            <View style={styles.tableContainer}>
                <DataTable>
                    <DataTable.Header style={styles.tableHeader}>
                        <DataTable.Title textStyle={styles.tableHeaderText}>Description</DataTable.Title>
                        <DataTable.Title numeric textStyle={styles.tableHeaderText}>Amount</DataTable.Title>
                        <DataTable.Title textStyle={styles.tableHeaderText}>Category</DataTable.Title>
                        <DataTable.Title textStyle={styles.tableHeaderText}>Date</DataTable.Title>
                    </DataTable.Header>

                    <ScrollView>
                        {filteredExpenses.map((exp, idx) => (
                            <DataTable.Row key={exp.id || idx} style={styles.tableRow}>
                                <DataTable.Cell textStyle={styles.tableCell}>{exp.description}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={styles.tableCell}>-${exp.amount}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.tableCell}>{exp.categoryName}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.tableCell}>{new Date(exp.date).toLocaleDateString()}</DataTable.Cell>
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
        backgroundColor: '#41416e', borderRadius: 16, padding: 24, marginBottom: 5,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4
    },
    summaryLabel: { color: '#fff', fontSize: 18, marginBottom: 6 },
    summaryAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
    summarySubtext: { color: '#ddd', fontSize: 14 },
    addButton: { marginVertical: 20, backgroundColor: '#00C897', borderRadius: 12, paddingVertical: 10 },
    modal: { backgroundColor: '#fff', padding: 24, marginHorizontal: 16, borderRadius: 16, elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#41416e', marginBottom: 20, textAlign: 'center' },
    input: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
    categorySelector: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 16, marginBottom: 16, backgroundColor: '#fff' },
    categoryDropdown: { maxHeight: 200, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', marginBottom: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    tableContainer: { borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 30 },
    tableHeader: { backgroundColor: '#f1f3f5' },
    tableHeaderText: { fontWeight: 'bold', color: '#41416e' },
    tableRow: { borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
    tableCell: { color: '#495057', fontSize: 14 },
});
