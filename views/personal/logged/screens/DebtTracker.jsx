import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getDebtsByUserId, createDebt, updateDebt, deleteDebt } from '../../../../src/api/axios';
import { DataTable, Portal, Modal, TextInput, Button, HelperText, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthSelector from '../../../MonthSelector';
import { validateField } from '../../../InputValidator';

export default function DebtTracker() {
  const { userId } = useAuth();

  const [debts, setDebts] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDebt, setNewDebt] = useState({ creditor: '', amount: '', dueDate: new Date().toISOString() });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);

  const isSameMonth = (date1, date2) =>
    date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

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
    setTotalAmount(total);
  }, [debts, selectedDate]);

  const handleDebtChange = (field, value) => {
    setNewDebt(prev => ({ ...prev, [field]: value }));

    let type = field === 'creditor' ? 'nameOrDescription' : field === 'amount' ? 'positiveNumber' : null;
    if (type) {
      const result = validateField(type, value);
      setFormErrors(prev => ({ ...prev, [field]: result.valid ? null : result.message }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDebt(prev => ({
        ...prev,
        dueDate: selectedDate.toISOString()
      }));
    }
  };

  const handleCreateDebt = async () => {
    const { creditor, amount } = newDebt;

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
        status: "PENDING"
      });
      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Error creating debt.');
    }
  };

  const handleUpdateDebtStatus = async (debtId) => {
    try {
      const debtToUpdate = debts.find(d => d.id === debtId);
      if (!debtToUpdate) {
        Alert.alert("Error", "Debt not found");
        return;
      }

      const payload = {
        userId,
        status: "PAID",
        creditor: debtToUpdate.creditor,
        amount: debtToUpdate.amount,
        date: debtToUpdate.date
          ? (typeof debtToUpdate.date === 'string' ? debtToUpdate.date : debtToUpdate.date.toISOString())
          : new Date().toISOString()
      };

      console.log("📤 Actualizando deuda:", payload);

      await updateDebt(debtId, payload);

      setDebts(prev =>
        prev.map(d => d.id === debtId ? { ...d, status: "PAID" } : d)
      );

    } catch (err) {
      console.error("❌ Error al actualizar el estado de la deuda:", err);
      Alert.alert("Error", "Failed to update debt status");
    }
  };

  const handleDeleteDebt = async (debtId) => {
    Alert.alert("Delete Debt", "Are you sure you want to delete this debt?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteDebt(debtId);
            fetchData();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not delete the debt.");
          }
        }
      }
    ]);
  };

  const openModal = () => {
    setModalVisible(true);
    setError('');
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewDebt({ creditor: '', amount: '', dueDate: new Date().toISOString() });
    setFormErrors({});
    setError('');
  };

  if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <View style={styles.container}>
      <View>
        <MonthSelector
          selectedMonth={selectedDate}
          onSelectMonth={(date) => {
            setSelectedDate(date);
          }}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Debts</Text>
          <Text style={styles.summaryAmount}>${totalAmount.toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>This Month</Text>
        </View>
      </View>

      <View style={styles.tableContainer}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title textStyle={styles.tableHeaderText}>Creditor</DataTable.Title>
            <DataTable.Title numeric textStyle={styles.tableHeaderText}>Amount</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Status</DataTable.Title>
            <DataTable.Title textStyle={styles.tableHeaderText}>Actions</DataTable.Title>
          </DataTable.Header>

          <ScrollView>
            {filteredDebts.map((debt) => (
              <DataTable.Row key={`${debt.id}-${debt.status}`}>
                <DataTable.Cell>{debt.creditor}</DataTable.Cell>
                <DataTable.Cell numeric>${debt.amount.toFixed(2)}</DataTable.Cell>
                <DataTable.Cell>
                  <Text style={{ color: debt.status === "PAID" ? '#34C759' : '#007AFF' }}>
                    {debt.status}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Menu
                    visible={menuVisible === debt.id}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                      <TouchableOpacity onPress={() => setMenuVisible(debt.id)}>
                        <Text style={{ color: '#41416e', fontWeight: 'bold' }}>Actions</Text>
                      </TouchableOpacity>
                    }
                  >
                    {debt.status === "PENDING" && (
                      <Menu.Item onPress={() => handleUpdateDebtStatus(debt.id)} title="Mark as Paid" />
                    )}

                    {debt.status === "PAID" && (
                      <Menu.Item onPress={() => handleDeleteDebt(debt.id)} title="Delete" />
                    )}
                  </Menu>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </ScrollView>
        </DataTable>
      </View>

      <Button mode="contained" onPress={openModal} style={styles.addButton}>Add Debt</Button>

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>New Debt</Text>

          <TextInput
            label="Creditor"
            value={newDebt.creditor}
            onChangeText={text => handleDebtChange('creditor', text)}
            style={styles.input}
          />
          {formErrors.creditor && <HelperText type="error">{formErrors.creditor}</HelperText>}

          <TextInput
            label="Amount"
            value={newDebt.amount}
            onChangeText={text => handleDebtChange('amount', text)}
            keyboardType="numeric"
            style={styles.input}
          />
          {formErrors.amount && <HelperText type="error">{formErrors.amount}</HelperText>}

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <View style={styles.modalButtons}>
            <Button onPress={closeModal}>Cancel</Button>
            <Button mode="contained" onPress={handleCreateDebt}>Save</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9', justifyContent: 'flex-start' },
  monthTabs: { flexDirection: 'row', marginBottom: 20 },
  monthItem: { marginHorizontal: 16, fontSize: 16, color: '#666' },
  activeMonth: { color: '#41416e', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#00C897' },
  summaryCard: {
    backgroundColor: '#41416e', borderRadius: 16, padding: 24, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4
  },
  summaryLabel: { color: '#fff', fontSize: 18, marginBottom: 6 },
  summaryAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
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
  input: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});
