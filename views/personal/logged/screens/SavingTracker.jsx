import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable, Portal, Modal, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getSavingsByUserId, createSaving } from '../../../../src/api/axios';

export default function SavingTracker() {
  const { userId } = useAuth();
  const monthScrollRef = useRef(null);

  const [savings, setSavings] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [months, setMonths] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [newSaving, setNewSaving] = useState({ amount: '', description: '' });
  const [error, setError] = useState('');

  const isSameMonth = (date1, date2) =>
    date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

  const fetchSavings = async () => {
    if (!userId) return;
    try {
      const savingsData = await getSavingsByUserId(userId);
      setSavings(Array.isArray(savingsData) ? savingsData : []);
    } catch (err) {
      console.error('Error fetching savings:', err);
      setSavings([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMonths = (centerDate) => {
    const generated = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(centerDate);
      date.setMonth(centerDate.getMonth() - 2 + i);
      return {
        label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
        date
      };
    });
    setMonths(generated);
    setTimeout(() => {
      monthScrollRef.current?.scrollTo({ x: 140, animated: true });
    }, 50);
  };

  const handleSelectMonth = (date) => {
    setSelectedDate(date);
    generateMonths(date);
  };

  useEffect(() => {
    fetchSavings();
    generateMonths(new Date());
  }, [userId]);

  useEffect(() => {
    const filtered = savings.filter(saving => isSameMonth(new Date(saving.date), selectedDate));
    setFilteredSavings(filtered);
    const total = filtered.reduce((sum, saving) => sum + parseFloat(saving.amount), 0);
    setTotalSaved(total);
  }, [savings, selectedDate]);

  const handleCreateSaving = async () => {
    const { amount, description } = newSaving;
    if (!amount || !description) return setError('Todos los campos son requeridos');

    try {
      await createSaving({ userId, amount: parseFloat(amount), description });
      closeModal();
      fetchSavings(); // Refresca la tabla
    } catch (err) {
      console.error('Error creating saving:', err);
      setError('Error al guardar el ahorro');
    }
  };

  const openModal = () => {
    setModalVisible(true);
    setError('');
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewSaving({ amount: '', description: '' });
    setError('');
  };

  if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <View style={styles.container}>
      <View>
        {/* Selector de Meses */}
        <ScrollView ref={monthScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.monthTabs}>
          {months.map((month, index) => (
            <TouchableOpacity key={index} onPress={() => handleSelectMonth(new Date(month.date))}>
              <Text style={[
                styles.monthItem,
                isSameMonth(selectedDate, new Date(month.date)) && styles.activeMonth
              ]}>
                {month.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Resumen de ahorro */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Saved</Text>
          <Text style={styles.summaryAmount}>${totalSaved.toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>This Month</Text>
        </View>
      </View>

      {/* Tabla de ahorros */}
      <View style={styles.tableContainer}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title textStyle={styles.tableHeaderText}>Description</DataTable.Title>
            <DataTable.Title numeric textStyle={styles.tableHeaderText}>Amount</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Date</DataTable.Title>
          </DataTable.Header>

          <ScrollView>
            {filteredSavings.map((saving, idx) => (
              <DataTable.Row key={saving.id || idx} style={styles.tableRow}>
                <DataTable.Cell>{saving.description}</DataTable.Cell>
                <DataTable.Cell numeric>${parseFloat(saving.amount).toFixed(2)}</DataTable.Cell>
                <DataTable.Cell>{new Date(saving.date).toLocaleDateString()}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </ScrollView>
        </DataTable>
      </View>

      {/* Botón agregar ahorro */}
      <Button mode="contained" onPress={openModal} style={styles.addButton}>Add Saving</Button>

      {/* Modal */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>New Saving</Text>

          <TextInput
            label="Description"
            value={newSaving.description}
            onChangeText={(text) => setNewSaving(prev => ({ ...prev, description: text }))}
            style={styles.input}
          />

          <TextInput
            label="Amount"
            value={newSaving.amount}
            onChangeText={(text) => setNewSaving(prev => ({ ...prev, amount: text }))}
            keyboardType="numeric"
            style={styles.input}
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <View style={styles.modalButtons}>
            <Button onPress={closeModal}>Cancel</Button>
            <Button mode="contained" onPress={handleCreateSaving}>Save</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },

  monthTabs: { flexDirection: 'row', marginBottom: 20 },
  monthItem: { marginHorizontal: 16, fontSize: 16, color: '#666' },
  activeMonth: { color: '#41416e', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#00C897' },

  summaryCard: {
    backgroundColor: '#41416e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  summaryLabel: { color: '#fff', fontSize: 18, marginBottom: 6 },
  summaryAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
  summarySubtext: { color: '#ddd', fontSize: 14 },

  tableContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 30
  },
  tableHeader: {
    backgroundColor: '#f1f3f5'
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#41416e'
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5'
  },

  addButton: {
    marginVertical: 20,
    backgroundColor: '#00C897',
    borderRadius: 12,
    paddingVertical: 10
  },

  modal: {
    backgroundColor: '#fff',
    padding: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#41416e',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
});
