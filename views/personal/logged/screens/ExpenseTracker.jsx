import { StyleSheet, View, Text, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getPersonalExpensesByUserId, getAllCategories } from '../../../../src/api/axios';
import { DataTable } from 'react-native-paper';

export default function ExpenseTracker() {
    const { userId } = useAuth();
    const [personalExpenses, setPersonalExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            } catch (error) {
                console.error('Error al obtener los gastos personales:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error al obtener las categorías:', error);
            }
        };

        fetchPersonalExpenses();
        fetchCategories();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Cargando gastos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView horizontal>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Descripción</DataTable.Title>
                        <DataTable.Title numeric>Monto</DataTable.Title>
                        <DataTable.Title>Categoría</DataTable.Title>
                        <DataTable.Title>Fecha</DataTable.Title>
                    </DataTable.Header>

                    {personalExpenses.map((expense, index) => (
                        <DataTable.Row key={expense.id || index}>
                            <DataTable.Cell>{expense.description}</DataTable.Cell>
                            <DataTable.Cell numeric>${expense.amount}</DataTable.Cell>
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
});