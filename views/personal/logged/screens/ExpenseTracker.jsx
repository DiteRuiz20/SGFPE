import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getPersonalExpensesByUserId, getAllCategories, createPersonalExpense } from '../../../../src/api/axios';
import { DataTable, Portal, Modal, TextInput, Button, HelperText, List, Divider, TouchableRipple } from 'react-native-paper';

export default function ExpenseTracker() {
    const { userId } = useAuth();
    const [personalExpenses, setPersonalExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [totalAmount, setTotalAmount] = useState(0);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        categoryId: '',
    });
    const [error, setError] = useState('');

    const getMonthName = (date) => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    const filterExpensesByMonth = (expenses, date) => {
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === date.getMonth() && 
                   expenseDate.getFullYear() === date.getFullYear();
        });
    };

    const calculateTotalAmount = (expenses) => {
        return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    };

    const changeMonth = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedDate(newDate);
    };

    useEffect(() => {
        if (personalExpenses.length > 0) {
            const filtered = filterExpensesByMonth(personalExpenses, selectedDate);
            setFilteredExpenses(filtered);
            setTotalAmount(calculateTotalAmount(filtered));
            console.log('Gastos filtrados para', getMonthName(selectedDate), ':', filtered);
        }
    }, [selectedDate, personalExpenses]);

    const fetchPersonalExpenses = async () => {
        if (!userId) {
            console.warn('No userId found');
            return;
        }

        try {
            const response = await getPersonalExpensesByUserId(userId);
            console.log('Gastos personales obtenidos:', response);

            if (!response || !Array.isArray(response)) {
                console.warn('No hay gastos registrados para este usuario.');
                setPersonalExpenses([]);
                return;
            }

            const fetchedExpenses = response.map(expense => ({
                ...expense,
                categoryName: expense.categoryName || 'Sin categoría',
            }));

            setPersonalExpenses(fetchedExpenses);

            // Establecer la fecha inicial al mes más reciente con gastos
            if (fetchedExpenses.length > 0) {
                const dates = fetchedExpenses.map(expense => new Date(expense.date));
                const mostRecentDate = new Date(Math.max(...dates));
                setSelectedDate(mostRecentDate);
            }

        } catch (error) {
            console.error('Error al obtener los gastos personales:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('UserId actual:', userId);
        fetchPersonalExpenses();

        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error al obtener las categorías:', error);
            }
        };

        fetchCategories();
    }, [userId]);

    const handleCreateExpense = async () => {
        if (!newExpense.description || !newExpense.amount || !selectedCategory) {
            setError('Por favor, complete todos los campos');
            return;
        }

        if (!userId) {
            setError('No se encontró el ID del usuario');
            return;
        }

        try {
            console.log('Creando gasto para el usuario:', userId);

            const expenseData = {
                description: newExpense.description,
                amount: parseFloat(newExpense.amount),
                categoryId: selectedCategory.id,
                userId: userId,
            };

            console.log('Datos completos a enviar:', JSON.stringify(expenseData, null, 2));
            await createPersonalExpense(expenseData);
            setVisible(false);
            setNewExpense({
                description: '',
                amount: '',
                categoryId: ''
            });
            setSelectedCategory(null);
            fetchPersonalExpenses();
        } catch (error) {
            console.error('Error al crear el gasto:', error);
            setError('Error al crear el gasto. Por favor, intente nuevamente.');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Cargando gastos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <Text style={styles.monthArrow}>{'<'}</Text>
                </TouchableOpacity>
                
                <Text style={styles.monthText}>
                    {getMonthName(selectedDate)}
                </Text>

                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <Text style={styles.monthArrow}>{'>'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Gastado</Text>
                <Text style={styles.summaryAmount}>-${totalAmount.toFixed(2)}</Text>
                <Text style={styles.summarySubtext}>Gasto del mes</Text>
            </View>

            <Button 
                mode="contained" 
                onPress={() => setVisible(true)}
                style={styles.addButton}
            >
                Agregar Gasto
            </Button>

            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Nuevo Gasto</Text>
                    
                    <TextInput
                        label="Descripción"
                        value={newExpense.description}
                        onChangeText={(text) => setNewExpense({...newExpense, description: text})}
                        style={styles.input}
                    />

                    <TextInput
                        label="Monto"
                        value={newExpense.amount}
                        onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <TouchableRipple onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                        <View style={styles.categorySelector}>
                            <Text style={styles.categoryLabel}>
                                {selectedCategory ? selectedCategory.name : 'Seleccionar Categoría'}
                            </Text>
                        </View>
                    </TouchableRipple>

                    {showCategoryDropdown && (
                        <View style={styles.categoryDropdown}>
                            {categories.map((category) => (
                                <React.Fragment key={category.id}>
                                    <List.Item
                                        title={category.name}
                                        onPress={() => {
                                            setSelectedCategory(category);
                                            setShowCategoryDropdown(false);
                                        }}
                                    />
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </View>
                    )}

                    {error ? <HelperText type="error">{error}</HelperText> : null}

                    <View style={styles.modalButtons}>
                        <Button onPress={() => setVisible(false)}>Cancelar</Button>
                        <Button mode="contained" onPress={handleCreateExpense}>
                            Guardar
                        </Button>
                    </View>
                </Modal>
            </Portal>

            <ScrollView horizontal>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Descripción</DataTable.Title>
                        <DataTable.Title numeric>Monto</DataTable.Title>
                        <DataTable.Title>Categoría</DataTable.Title>
                        <DataTable.Title>Fecha</DataTable.Title>
                    </DataTable.Header>

                    {filteredExpenses.map((expense, index) => (
                        <DataTable.Row key={expense.id || index}>
                            <DataTable.Cell>{expense.description}</DataTable.Cell>
                            <DataTable.Cell numeric>-${expense.amount}</DataTable.Cell>
                            <DataTable.Cell>{expense.categoryName}</DataTable.Cell>
                            <DataTable.Cell>
                                {new Date(expense.date).toLocaleDateString()}
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#41416e',
    },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    monthArrow: {
        fontSize: 24,
        color: '#41416e',
    },
    monthText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#41416e',
    },
    summaryCard: {
        backgroundColor: '#41416e',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    summaryLabel: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    summaryAmount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    summarySubtext: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.8,
    },
    addButton: {
        marginBottom: 16,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 8,
    },
    categorySelector: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 12,
        marginBottom: 12,
    },
    categoryLabel: {
        fontSize: 16,
        color: '#000',
    },
    categoryDropdown: {
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginBottom: 12,
    },
});