import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { PieChart } from 'react-native-chart-kit';
import { getPersonalExpensesByUserId, getDebtsByUserId, getSavingsByUserId } from '../../../../src/api/axios';
import { useAuth } from '../../../../src/auth/AuthContext';
import MonthSelector from '../../../MonthSelector';

export default function BudgetPlanning() {
  const { userId } = useAuth();
  const monthScrollRef = useRef(null);

  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);
  const [debts, setDebts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSameMonth = (date1, date2) =>
    date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

  useEffect(() => {
    fetchData();
    generateMonths(new Date());
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [expData, debtData, saveData] = await Promise.all([
        getPersonalExpensesByUserId(userId),
        getDebtsByUserId(userId),
        getSavingsByUserId(userId)
      ]);

      setExpenses(expData || []);
      setDebts(debtData || []);
      setSavings(saveData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredExpenses = expenses.filter(e => isSameMonth(new Date(e.date), selectedDate));
  const filteredSavings = savings.filter(s => isSameMonth(new Date(s.date), selectedDate));
  const filteredDebts = debts.filter(d => isSameMonth(new Date(d.date), selectedDate));

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalSavings = filteredSavings.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const totalDebts = filteredDebts.reduce((sum, d) => sum + parseFloat(d.amount), 0);

  const pieData = [
    {
      name: 'Gastos',
      amount: totalExpenses,
      color: '#FF6384',
      legendFontColor: '#333',
      legendFontSize: 14
    },
    {
      name: 'Ahorros',
      amount: totalSavings,
      color: '#00C897',
      legendFontColor: '#333',
      legendFontSize: 14
    },
  ].filter(item => item.amount > 0); // Oculta secciones vacías

  if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <View style={styles.container}>

      <View>
        {/* Meses */}
        <MonthSelector
          selectedMonth={selectedDate}
          onSelectMonth={(date) => {
            setSelectedDate(date);
          }}
        />

        {/* Totales */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Gastos: ${totalExpenses.toFixed(2)}</Text>
          <Text style={styles.summaryText}>Ahorros: ${totalSavings.toFixed(2)}</Text>
          <Text style={styles.summaryText}>Deudas: ${totalDebts.toFixed(2)}</Text>
        </View>
      </View>

      {/* PieChart comparativo */}
      <View style={styles.chartContainer}>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={350}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(65, 65, 110, ${opacity})`,
              labelColor: () => '#41416e',
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
  monthTabs: { flexDirection: 'row', marginBottom: 20 },
  monthItem: { marginHorizontal: 16, fontSize: 16, color: '#666' },
  activeMonth: { color: '#41416e', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#00C897' },
  summaryContainer: { marginBottom: 24 },
  summaryText: { fontSize: 18, color: '#41416e', marginBottom: 4 },
  chartContainer: { alignItems: 'center' },
  noDataText: { textAlign: 'center', marginTop: 50, color: '#495057', fontSize: 16 }
});
