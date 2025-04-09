import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable, Portal, Modal, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getSavingsByUserId, createSaving } from '../../../../src/api/axios';
import MonthSelector from '../../../MonthSelector';
import { Input } from '@rneui/base';
import { validateField } from '../../../InputValidator';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function SavingTracker() {
  const { userId } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [formErrors, setFormErrors] = useState({ description: '', amount: '' });

  const [savings, setSavings] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [months, setMonths] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
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
    const descValidation = validateField('nameOrDescription', description);
    const amountValidation = validateField('positiveNumber', amount);

    const errors = {};
    if (!descValidation.valid) errors.description = descValidation.message;
    if (!amountValidation.valid) errors.amount = amountValidation.message;

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createSaving({ userId, amount: parseFloat(amount), description }); // ✅ usa valores correctos
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
    setAmount('');
    setDescription('');
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
      </View>
            
      <ScrollView>
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Ahorros</Text>
            <Text style={styles.summaryAmount}>${totalSaved.toFixed(2)}</Text>
            <Text style={styles.summarySubtext}>Total de ahorros del mes</Text>
          </View>
          <View style={{ marginRight: 25 }}>
            <Icon name="hand-holding-usd" size={40} color="#fff" />
          </View>
        </View>

      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Icon name="plus" size={20} color="#3DC9A7" style={{ marginRight: 10 }} />
        <Text style={styles.addButtonText}>Nuevo ahorro</Text>
      </TouchableOpacity>

      <View style={styles.tableContainer}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title textStyle={styles.tableHeaderText}>Descripción</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Cantidad</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Fecha registro</DataTable.Title>
          </DataTable.Header>

          <View>
            {filteredSavings.map((saving, idx) => (
              <DataTable.Row key={saving.id || idx} style={styles.tableRow}>
                <DataTable.Cell>{saving.description}</DataTable.Cell>
                <DataTable.Cell>${parseFloat(saving.amount).toFixed(2)}</DataTable.Cell>
                <DataTable.Cell>{new Date(saving.date).toLocaleDateString()}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </View>
        </DataTable>
      </View>

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Nuevo ahorro</Text>

          <Input
            label="Descripción"
            placeholder="Ingresa la descripción"
            onChange={({ nativeEvent: { text } }) => {
              setDescription(text);
              const result = validateField('nameOrDescription', text);
              setFormErrors(prev => ({ ...prev, description: result.valid ? null : result.message }));
            }}
            errorMessage={formErrors.description}
          />

          <Input
            label="Cantidad"
            placeholder="Ingresa la cantidad"
            onChange={({ nativeEvent: { text } }) => {
              setAmount(text);
              const result = validateField('positiveNumber', text);
              setFormErrors(prev => ({ ...prev, amount: result.valid ? null : result.message }));
            }}
            keyboardType="numeric"
            errorMessage={formErrors.amount}
          />


          {error ? <HelperText type="error">{error}</HelperText> : null}

          <View style={styles.modalButtons}>
            <Button style={styles.primary_button} mode="contained" onPress={closeModal}>Cancelar</Button>
            <Button style={styles.secondary_button} mode="contained" onPress={handleCreateSaving}>Guardar</Button>
          </View>
        </Modal>
      </Portal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  summaryCard: {
    backgroundColor: '#3DC9A7', borderRadius: 16, padding: 24, marginBottom: 5,
    elevation: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#3dc1ad',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
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
    borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height: 50,
    shadowColor: '#3dc1ad',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  addButtonText: { color: 'black', fontSize: 16 },
  modal: { backgroundColor: '#fff', padding: 24, marginHorizontal: 16, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#3DC9A7', marginBottom: 20, textAlign: 'left' },
  input: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  primary_button: {
    width: '40%',
    backgroundColor: '#30437A',
    padding: 2,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#30387a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  secondary_button: {
    width: '40%',
    backgroundColor: '#3DC9A7',
    padding: 2,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#3dc1ad',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
});