import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { getMaterialUsagesByUserId, getOrdersByUserId } from '../../../../../src/api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MonthSelector from '../../../../MonthSelector';

const screenWidth = Dimensions.get('window').width;

export default function RawMaterialsGraphics() {
    const [materialUsages, setMaterialUsages] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const isSameMonth = (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    };

    useEffect(() => {
        const fetchData = async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            try {
                const [usageRes, orderRes] = await Promise.all([
                    getMaterialUsagesByUserId(userId),
                    getOrdersByUserId(userId)
                ]);
                setMaterialUsages(usageRes.data || []);
                setOrders(orderRes.data || []);
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        };

        fetchData();
    }, []);

    const totalMaterialCost = materialUsages
        .filter(u => isSameMonth(u.createdAt, selectedMonth))
        .reduce((sum, u) => sum + (u.totalCost || 0), 0);

    const totalNetProfit = orders
        .filter(o => isSameMonth(o.createdAt, selectedMonth))
        .reduce((sum, o) => sum + (o.netProfit || 0), 0);

    const balance = totalNetProfit - totalMaterialCost;

    const chartData = [
        {
            name: 'Ganancia neta',
            population: totalNetProfit,
            color: '#4AD8C2',
            legendFontColor: '#333',
            legendFontSize: 14
        },
        {
            name: 'Gasto en materiales',
            population: totalMaterialCost,
            color: '#FF8C69',
            legendFontColor: '#333',
            legendFontSize: 14
        },
    ].filter(d => typeof d.population === 'number' && d.population > 0);

    return (
        <ScrollView style={styles.container}>
            <MonthSelector selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
            <Text style={styles.title}>Ganancias vs Gastos</Text>
            
            {chartData.length > 0 ? (
                <PieChart
                    data={chartData}
                    width={screenWidth - 30}
                    height={220}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: () => '#333'
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            ) : (
                <Text style={styles.noDataText}>No hay información disponible para este mes.</Text>
            )}

            <View style={styles.summary}>
                <Text style={styles.label}>Ganancia neta:</Text>
                <Text style={styles.value}>${totalNetProfit.toFixed(2)}</Text>

                <Text style={styles.label}>Gasto en materiales:</Text>
                <Text style={styles.value}>${totalMaterialCost.toFixed(2)}</Text>

                <Text style={styles.label}>Balance:</Text>
                <Text style={[styles.value, { color: balance >= 0 ? 'green' : 'red' }]}>
                    ${balance.toFixed(2)}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#30437A',
        textAlign: 'center',
        marginBottom: 10,
    },
    summary: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f3f3f3',
        borderRadius: 8,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 10,
    },
    value: {
        fontSize: 16,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 30,
        color: 'gray',
    },
});
