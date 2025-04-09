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

  return (
    <View style={styles.container}>
      <View>
        <MonthSelector selectedMonth={selectedDate} onSelectMonth={setSelectedDate} />

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Total de Deudas</Text>
            <Text style={styles.summaryCantidad}>${totalCantidad.toFixed(2)}</Text>
            <Text style={styles.summarySubtext}>Este Mes</Text>
          </View>
          <View style={{ marginRight: 25 }}>
            <Icon name="money-check-alt" size={40} color="#fff" />
          </View>
        </View>
      </View>

      <View style={styles.tableContainer}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title textStyle={styles.tableHeaderText}>Acreedor</DataTable.Title>
            <DataTable.Title numeric textStyle={styles.tableHeaderText}>Cantidad</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Estado</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Acción</DataTable.Title>
          </DataTable.Header>

          <ScrollView>
            {filteredDebts.map((debt) => (
              <DataTable.Row key={`${debt.id}-${debt.status}`}>
                <DataTable.Cell>{debt.creditor}</DataTable.Cell>
                <DataTable.Cell numeric>${debt.amount.toFixed(2)}</DataTable.Cell>
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
          </ScrollView>
        </DataTable>
      </View>

      <Button mode="contained" onPress={openModal} style={styles.addButton}>Nueva Deuda</Button>

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Registrar Deuda</Text>

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
            <Button onPress={closeModal}>Cancelar</Button>
            <Button mode="contained" onPress={handleCreateDebt}>Guardar</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9', justifyContent: 'flex-start' },
  summaryCard: {
    backgroundColor: '#41416e', borderRadius: 16, padding: 24, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  summaryLabel: { color: '#fff', fontSize: 18, marginBottom: 6 },
  summaryCantidad: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
  summarySubtext: { color: '#ddd', fontSize: 14 },
  tableContainer: {
    borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 16
  },
  tableHeader: { backgroundColor: '#f1f3f5' },
  tableHeaderText: { fontWeight: 'bold', color: '#41416e' },
  addButton: {
    backgroundColor: '#00C897', borderRadius: 12, paddingVertical: 12, marginBottom: 16
  },
  modal: { backgroundColor: '#fff', padding: 24, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#41416e', marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});
