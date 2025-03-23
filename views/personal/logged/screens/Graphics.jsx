import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getPersonalExpensesByUserId } from '../../../../src/api/axios';
import { PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function Graphics() {
    const { userId } = useAuth();
    const monthScrollRef = useRef(null);

    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!userId) return;
        try {
            const expensesData = await getPersonalExpensesByUserId(userId);
            // ✅ Protegemos contra undefined o null
            setExpenses(Array.isArray(expensesData) ? expensesData : []);
        } catch (err) {
            console.error(err);
            setExpenses([]); // ✅ Aún si falla, no rompe
        } finally {
            setLoading(false);
        }
    };

    // ✅ Refresca la gráfica cada que entras a la pantalla
    useFocusEffect(
        useCallback(() => {fetchData();
        }, [userId])
    );

    useEffect(() => {
        const filtered = (expenses || []).filter(exp => isSameMonth(new Date(exp.date), selectedDate));
        setFilteredExpenses(filtered);
    }, [expenses, selectedDate]);

    // ✅ Generar meses y mover el scroll al mes actual
    useEffect(() => {
        generateMonths(new Date()); // Al cargar por primera vez centra el mes actual
    }, []);
    
    const generateMonths = (centerDate) => {
        const generatedMonths = Array.from({ length: 11 }, (_, i) => {
            const date = new Date(centerDate);
            date.setMonth(centerDate.getMonth() - 5 + i);
            return {
                label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                date
            };
        });
        setMonths(generatedMonths);
    
        // Centra el mes seleccionado en la posición 5
        setTimeout(() => {
            monthScrollRef.current?.scrollTo({ x: 115 * 5, animated: true });
        }, 50);
    };
    

    const isSameMonth = (date1, date2) =>
        date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

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

    if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

    return (
        <View style={styles.container}>
            <View style={styles.monthSelectorContainer}>
                <ScrollView
                    ref={monthScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.monthTabs}
                    contentContainerStyle={styles.monthTabsContent}
                >
                    {months.map((month, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setSelectedDate(new Date(month.date));
                                generateMonths(new Date(month.date)); // ✅ Recalcula meses y centra
                            }}
                            style={styles.monthItemContainer}
                        >
                            <Text style={[
                                styles.monthItem,
                                isSameMonth(selectedDate, new Date(month.date)) && styles.activeMonth
                            ]}>
                                {month.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.chartContainer}>
                {pieData.length > 0 ? (
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
                ) : (
                    <Text style={styles.noDataText}>No hay datos para este mes</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },

    monthSelectorContainer: { marginBottom: 20 },
    monthTabs: { flexDirection: 'row' },
    monthTabsContent: { paddingHorizontal: 10 },
    monthItemContainer: { paddingHorizontal: 10 },
    monthItem: { marginHorizontal: 16, fontSize: 16, color: '#666' },
    activeMonth: { color: '#41416e', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#00C897' },

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