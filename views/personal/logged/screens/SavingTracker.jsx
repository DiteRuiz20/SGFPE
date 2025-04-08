import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable, Portal, Modal, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getSavingsByUserId, createSaving } from '../../../../src/api/axios';
import MonthSelector from '../../../MonthSelector';
import { validateField } from '../../../InputValidator';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function SavingTracker() {
  const { userId } = useAuth();
  const monthScrollRef = useRef(null);

  const [savings, setSavings] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [months, setMonths] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [newSaving, setNewSaving] = useState({ amount: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
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

  const handleSavingChange = (field, value) => {
    setNewSaving(prev => ({ ...prev, [field]: value }));

    const type = field === 'description' ? 'nameOrDescription' : field === 'amount' ? 'positiveNumber' : null;
    if (type) {
      const result = validateField(type, value);
      setFormErrors(prev => ({ ...prev, [field]: result.valid ? null : result.message }));
    }
  };

  const handleCreateSaving = async () => {
    const { amount, description } = newSaving;

    const descValidation = validateField('nameOrDescription', description);
    const amountValidation = validateField('positiveNumber', amount);

    const errors = {};
    if (!descValidation.valid) errors.description = descValidation.message;
    if (!amountValidation.valid) errors.amount = amountValidation.message;

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createSaving({ userId, amount: parseFloat(amount), description });
      closeModal();
      fetchSavings();
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
    setFormErrors({});
    setError('');
  };

  if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

  filteredSavings.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={styles.container}>
      <View>
        <MonthSelector
          selectedMonth={selectedDate}
          onSelectMonth={setSelectedDate}
        />

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Ahorros</Text>
            <Text style={styles.summaryAmount}>${totalSaved.toFixed(2)}</Text>
            <Text style={styles.summarySubtext}>Total de ahorros del mes</Text>
          </View>
          <View style={{marginRight: 25}}>
            <Icon name="hand-holding-usd" size={40} color="#fff" />
          </View>
        </View>
      </View>

      <Button mode="contained" onPress={openModal} style={styles.addButton} labelStyle={styles.addButtonText}>Agregar ahorro</Button>

      <View style={styles.tableContainer}>
        <DataTable>
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title textStyle={styles.tableHeaderText}>Description</DataTable.Title>
          <DataTable.Title textStyle={styles.tableHeaderText}>Amount</DataTable.Title>
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

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Nuevo ahorro</Text>

          <TextInput
            label="Description"
            value={newSaving.description}
            onChangeText={text => handleSavingChange('description', text)}
            style={styles.input}
          />
          {formErrors.description && <HelperText type="error">{formErrors.description}</HelperText>}

          <TextInput
            label="Amount"
            value={newSaving.amount}
            onChangeText={text => handleSavingChange('amount', text)}
            keyboardType="numeric"
            style={styles.input}
          />
          {formErrors.amount && <HelperText type="error">{formErrors.amount}</HelperText>}

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <View style={styles.modalButtons}>
            <Button onPress={closeModal}>Cancelar</Button>
            <Button mode="contained" onPress={handleCreateSaving}>Guardar</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  summaryCard: {
    backgroundColor: '#3DC9A7', borderRadius: 16, padding: 24, marginBottom: 5,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  summaryLabel: { color: '#fff', fontSize: 20, marginBottom: 8 },
  summaryAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  summarySubtext: { color: '#eee', fontSize: 16 },
  tableContainer: {
    borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 30
  },
  tableHeader: { backgroundColor: '#f1f3f5', justifyContent: 'space-between' },
  tableHeaderText: { fontWeight: 'bold', color: '#41416e' },
  tableRow: { borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  addButton: {
    marginVertical: 20, backgroundColor: 'white', borderColor: '#3DC9A7', borderWidth: 1,
    borderRadius: 12, paddingVertical: 10
  },
  addButtonText: { color: 'black', fontSize: 16 },
  modal: { backgroundColor: '#fff', padding: 24, marginHorizontal: 16, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#41416e', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});