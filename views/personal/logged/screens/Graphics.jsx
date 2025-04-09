import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getPersonalExpensesByUserId, getSavingsByUserId, getDebtsByUserId } from '../../../../src/api/axios';
import { PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import MonthSelector from '../../../MonthSelector';

export default function Graphics() {
    const { userId } = useAuth();
    const isSameMonth = (date1, date2) =>
        date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [savings, setSavings] = useState([]);
    const [debts, setDebts] = useState([]);

    const getFilteredTotal = (items, dateKey) => {
        return items
            .filter(item => isSameMonth(new Date(item[dateKey]), selectedDate))
            .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    };

    const totalSavings = getFilteredTotal(savings, 'date');
    const totalDebts = getFilteredTotal(debts, 'date');


    const fetchData = async () => {
        if (!userId) return;
        try {
            const [expensesData, savingsData, debtsData] = await Promise.all([
                getPersonalExpensesByUserId(userId),
                getSavingsByUserId(userId),
                getDebtsByUserId(userId)
            ]);

            setExpenses(Array.isArray(expensesData) ? expensesData : []);
            setSavings(Array.isArray(savingsData) ? savingsData : []);
            setDebts(Array.isArray(debtsData) ? debtsData : []);
        } catch (err) {
            console.error(err);
            setExpenses([]);
            setSavings([]);
            setDebts([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Refresca la gráfica cada que entras a la pantalla
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [userId])
    );

    useEffect(() => {
        const filtered = (expenses || []).filter(exp => isSameMonth(new Date(exp.date), selectedDate));
        setFilteredExpenses(filtered);
    }, [expenses, selectedDate]);

    const getPieChartData = () => {
        const data = filteredExpenses.reduce((acc, exp) => {
            const category = exp.categoryName || 'Sin categoría';
            acc[category] = (acc[category] || 0) + parseFloat(exp.amount);
            return acc;
        }, {});

        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#00C897', '#9C27B0', '#FF9800', '#4CAF50'];

        return Object.entries(data).map(([category, amount], index) => ({
            name: category,
            amount,
            color: colors[index % colors.length],
            legendFontColor: '#333',
            legendFontSize: 14,
        }));
    };

    const pieData = getPieChartData();

    const hasExpenseData = pieData.length > 0;
    const hasSavingsDebtsData = totalSavings > 0 || totalDebts > 0;

    if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

    return (
        <View style={styles.container}>
            <View style={styles.monthSelectorContainer}>
                <MonthSelector
                    selectedMonth={selectedDate}
                    onSelectMonth={(date) => setSelectedDate(date)}
                />
            </View>

            <View style={styles.chartContainer}>
                {hasExpenseData && (
                    <PieChart
                        data={pieData}
                        width={350}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#41416e',
                            backgroundGradientFrom: '#41416e',
                            backgroundGradientTo: '#41416e',
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
                        }}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                )}
            </View>

            <View style={styles.chartContainer}>
                {hasSavingsDebtsData && (
                    <PieChart
                        data={[
                            {
                                name: 'Ahorros',
                                amount: totalSavings,
                                color: '#4CAF50',
                                legendFontColor: '#333',
                                legendFontSize: 14,
                            },
                            {
                                name: 'Deudas',
                                amount: totalDebts,
                                color: '#FF6384',
                                legendFontColor: '#333',
                                legendFontSize: 14,
                            },
                        ]}
                        width={350}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#41416e',
                            backgroundGradientFrom: '#41416e',
                            backgroundGradientTo: '#41416e',
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
                        }}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                )}
            </View>

            {!hasExpenseData && !hasSavingsDebtsData && (
                <Text style={styles.noDataText}>No hay datos disponibles para este mes</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },

    monthSelectorContainer: { marginBottom: 20 },

    chartCard: {
        backgroundColor: '#41416e',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },

    noDataText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#495057',
        fontSize: 16
    }
});