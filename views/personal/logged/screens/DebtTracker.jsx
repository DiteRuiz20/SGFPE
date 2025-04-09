import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getDebtsByUserId, createDebt, updateDebt } from '../../../../src/api/axios';
import { DataTable, Portal, Modal, Button, HelperText, Menu } from 'react-native-paper';
import MonthSelector from '../../../MonthSelector';
import { Input } from '@rneui/base';
import { validateField } from '../../../InputValidator';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function DebtTracker() {
  const { userId } = useAuth();
  const [debts, setDebts] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalCantidad, setTotalCantidad] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [creditor, setAcreedor] = useState('');
  const [amount, setCantidad] = useState('');
  const [formErrors, setFormErrors] = useState({ creditor: '', amount: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(null);

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  const fetchData = async () => {
    if (!userId) return;
    try {
      const debtsData = await getDebtsByUserId(userId);
      const normalizedDebts = Array.isArray(debtsData) ? debtsData.map(debt => ({
        id: debt.id || debt._id,
        creditor: debt.creditor,
        amount: parseFloat(debt.amount),
        date: new Date(debt.date),
        dueDate: new Date(debt.dueDate),
        status: debt.status,
      })) : [];
      setDebts(normalizedDebts);
    } catch (err) {
      console.error('Error en fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    const filtered = debts.filter(debt => isSameMonth(debt.date, selectedDate));
    setFilteredDebts(filtered);
    const total = filtered.reduce((sum, debt) => sum + debt.amount, 0);
    setTotalCantidad(total);
  }, [debts, selectedDate]);

  const handleCreateDebt = async () => {
    const creditorValidation = validateField('nameOrDescription', creditor);
    const amountValidation = validateField('positiveNumber', amount);

    const errors = {};
    if (!creditorValidation.valid) errors.creditor = creditorValidation.message;
    if (!amountValidation.valid) errors.amount = amountValidation.message;

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createDebt({
        creditor,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        userId,
        status: 'PENDING'
      });
      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Error creating debt.');
    }
  };

  const handleUpdateDebtEstado = async (debtId) => {
    try {
      const debtToUpdate = debts.find(d => d.id === debtId);
      if (!debtToUpdate) {
        Alert.alert('Error', 'Debt not found');
        return;
      }

      const payload = {
        userId,
        status: 'PAID',
        creditor: debtToUpdate.creditor,
        amount: debtToUpdate.amount,
        date: debtToUpdate.date instanceof Date
          ? debtToUpdate.date.toISOString()
          : debtToUpdate.date
      };

      await updateDebt(debtId, payload);

      setDebts(prev =>
        prev.map(d => d.id === debtId ? { ...d, status: 'PAID' } : d)
      );

    } catch (err) {
      console.error('❌ Error al actualizar el estado de la deuda:', err);
      Alert.alert('Error', 'Failed to update debt status');
    }
  };

  const openModal = () => {
    setModalVisible(true);
    setError('');
  };

  const closeModal = () => {
    setModalVisible(false);
    setAcreedor('');
    setCantidad('');
    setFormErrors({});
    setError('');
  };

  if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

  filteredDebts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={styles.container}>
      <View>
        <MonthSelector selectedMonth={selectedDate} onSelectMonth={setSelectedDate} />
      </View>
      
      <ScrollView>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Deudas</Text>
            <Text style={styles.summaryCantidad}>${totalCantidad.toFixed(2)}</Text>
            <Text style={styles.summarySubtext}>Deudas de este mes</Text>
          </View>
          <View style={{ marginRight: 25 }}>
            <Icon name="money-check-alt" size={40} color="#fff" />
          </View>
        </View>
      

      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Icon name="plus" size={20} color="#B1B1B1" style={{ marginRight: 10 }} />
        <Text style={styles.addButtonText}>Nueva deuda</Text>
      </TouchableOpacity>

      <View style={styles.tableContainer}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title textStyle={styles.tableHeaderText}>Acreedor</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Cantidad</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Estado</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Acción</DataTable.Title>
          </DataTable.Header>

          <View>
            {filteredDebts.map((debt) => (
              <DataTable.Row key={`${debt.id}-${debt.status}`}>
                <DataTable.Cell>{debt.creditor}</DataTable.Cell>
                <DataTable.Cell>${debt.amount.toFixed(2)}</DataTable.Cell>
                <DataTable.Cell>
                  <Text style={{ color: debt.status === 'PAID' ? '#34C759' : '#007AFF' }}>
                    {debt.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  {debt.status === 'PENDING' && (
                    <TouchableOpacity onPress={() => handleUpdateDebtEstado(debt.id)}>
                      <Text style={{ color: '#41416e', fontWeight: 'bold' }}>Marcar como Pagado</Text>
                    </TouchableOpacity>
                  )}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </View>
        </DataTable>
      </View>

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Nueva Deuda</Text>

          <Input
            label="Acreedor"
            placeholder="Nombre del acreedor"
            onChange={({ nativeEvent: { text } }) => {
              setAcreedor(text);
              const result = validateField('nameOrDescription', text);
              setFormErrors(prev => ({ ...prev, creditor: result.valid ? null : result.message }));
            }}
            errorMessage={formErrors.creditor}
          />

          <Input
            label="Cantidad"
            placeholder="Monto a deber"
            onChange={({ nativeEvent: { text } }) => {
              setCantidad(text);
              const result = validateField('positiveNumber', text);
              setFormErrors(prev => ({ ...prev, amount: result.valid ? null : result.message }));
            }}
            keyboardType="numeric"
            errorMessage={formErrors.amount}
          />

          {!!error && <HelperText type="error">{error}</HelperText>}

          <View style={styles.modalButtons}>
            <Button style={styles.primary_button} mode="contained" onPress={closeModal}>Cancelar</Button>
            <Button style={styles.secondary_button} mode="contained" onPress={handleCreateDebt}>Guardar</Button>
          </View>
        </Modal>
      </Portal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9', justifyContent: 'flex-start' },
  summaryCard: {
    backgroundColor: '#B1B1B1', borderRadius: 16, padding: 24, marginBottom: 5,
    elevation: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  summaryLabel: { color: '#fff', fontSize: 20, marginBottom: 8 },
  summaryCantidad: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  summarySubtext: { color: '#eee', fontSize: 16 },
  tableContainer: {
    borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 16
  },
  tableHeader: { backgroundColor: '#f1f3f5' },
  tableHeaderText: { fontWeight: 'bold', color: '#41416e' },
  modal: { backgroundColor: '#fff', padding: 24, marginHorizontal: 16, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#B1B1B1', marginBottom: 20, textAlign: 'left' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  addButtonText: { color: 'black', fontSize: 16 },
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
  addButton: {
    marginVertical: 20, backgroundColor: 'white', borderColor: '#B1B1B1', borderWidth: 1,
    borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height: 50,
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
});
