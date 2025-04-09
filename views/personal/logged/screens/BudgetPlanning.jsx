import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { PieChart } from 'react-native-chart-kit';
import { getPersonalExpensesByUserId, getDebtsByUserId, getSavingsByUserId } from '../../../../src/api/axios';
import { useAuth } from '../../../../src/auth/AuthContext';
import MonthSelector from '../../../MonthSelector';
import { useFocusEffect } from '@react-navigation/native';
import { Divider } from 'react-native-elements';

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

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalSavings = savings.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const totalDebts = debts.reduce((sum, d) => sum + parseFloat(d.amount), 0);


  useEffect(() => {
    fetchData();
    generateMonths(new Date());
  }, [userId, selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [userId, selectedDate])
  );


  const fetchData = async () => {
    if (!userId) return;
    try {
      const [expData = [], debtData = [], saveData = []] = await Promise.all([
        getPersonalExpensesByUserId(userId),
        getDebtsByUserId(userId),
        getSavingsByUserId(userId)
      ]);

      const filteredExpenses = Array.isArray(expData) ? expData.filter(e => isSameMonth(new Date(e.date), selectedDate)) : [];
      const filteredDebts = Array.isArray(debtData) ? debtData.filter(d => isSameMonth(new Date(d.date), selectedDate)) : [];
      const filteredSavings = Array.isArray(saveData) ? saveData.filter(s => isSameMonth(new Date(s.date), selectedDate)) : [];

      setExpenses(filteredExpenses);
      setDebts(filteredDebts);
      setSavings(filteredSavings);
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

  const totalFunds = totalSavings - totalExpenses;

  const pieData = [];

  if (totalExpenses > 0) {
    pieData.push({
      name: 'Gastos',
      amount: totalExpenses,
      color: '#30437A',
      legendFontColor: '#333',
      legendFontSize: 14
    });
  }

  if (totalSavings > 0) {
    pieData.push({
      name: 'Ahorros',
      amount: totalSavings,
      color: '#3DC9A7',
      legendFontColor: '#333',
      legendFontSize: 14
    });
  }

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
          <View style={styles.topCards}>
            <View style={styles.savCard}>
              <Text style={styles.summaryTitle}>Ahorros:</Text>
              <Text style={styles.summaryText}>${totalSavings.toFixed(2)}</Text>
            </View>

            <View style={styles.expCard}>
              <Text style={styles.summaryTitle}>Gastos:</Text>
              <Text style={styles.summaryText}>${totalExpenses.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.topCards}>
            <View style={styles.fondCard}>
              <Text style={styles.summaryTitle}>Fondos:</Text>
              <Text style={styles.summaryText}>${totalFunds.toFixed(2)}</Text>
            </View>
            <View style={styles.debtCard}>
              <Text style={styles.summaryTitle}>Deudas:</Text>
              <Text style={styles.summaryText}>${totalDebts.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>

      <Divider style={styles.divider} />

      <Text style={{ fontSize: 24, color: '#30437A', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' }}>
        BALANCE TOTAL
      </Text>
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
  summaryText: { fontSize: 18, color: '#fff', marginBottom: 4, textAlign: 'center' },
  summaryTitle: { fontSize: 18, color: '#fff', marginBottom: 4, fontWeight: 'bold', textAlign: 'left' },
  chartContainer: { alignItems: 'center' },
  noDataText: { textAlign: 'center', marginTop: 50, color: '#495057', fontSize: 16 },
  divider: { width: '100%', height: 2, backgroundColor: '#EAEAEA', marginBottom: 15 },
  expCard: {
    width: '40%',
    backgroundColor: '#30437A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#30387a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  savCard: {
    width: '40%',
    backgroundColor: '#3DC9A7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#3dc1ad',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  fondCard: {
    width: '40%',
    backgroundColor: '#3DB1A7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#3db1ad',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  debtCard: {
    width: '40%',
    backgroundColor: '#B1B1B1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  topCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
});
