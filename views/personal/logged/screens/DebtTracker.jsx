import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getDebtsByUserId, createDebt, updateDebt, deleteDebt } from '../../../../src/api/axios';
import { DataTable, Portal, Modal, TextInput, Button, HelperText, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DebtTracker() {
  const { userId } = useAuth();
  const monthScrollRef = useRef(null);

  const [debts, setDebts] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState(0);
  const [months, setMonths] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDebt, setNewDebt] = useState({ creditor: '', amount: '', dueDate: new Date().toISOString() });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null); // Control individual del menú

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

    // Centrar el mes seleccionado en la posición 5
    setTimeout(() => {
      monthScrollRef.current?.scrollTo({ x: 140, animated: true });
    }, 50);
  };

  useEffect(() => {
    fetchData();
    generateMonths(new Date());
  }, [userId]);

  const handleSelectMonth = (date) => {
    setSelectedDate(date);
    generateMonths(date);  // ✅ Recalcula y centra el mes seleccionado
  };
  
  useEffect(() => {
    const filtered = debts.filter(debt => isSameMonth(debt.date, selectedDate));
    setFilteredDebts(filtered);
    const total = filtered.reduce((sum, debt) => sum + debt.amount, 0);
    setTotalAmount(total);
  }, [debts, selectedDate]);

  const handleDebtChange = (field, value) => {
    setNewDebt(prev => ({ ...prev, [field]: value }));
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
    const { creditor, amount, dueDate } = newDebt;
    if (!creditor || !amount || !dueDate) return setError('Please fill all fields');

    try {
      await createDebt({ creditor, amount: parseFloat(amount), dueDate, userId, status: "PENDING" });
      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Error creating debt.');
    }
  };

  const handleUpdateDebtStatus = async (debtId, newStatus) => {
    try {
      const debtToUpdate = debts.find(d => d.id === debtId);
      if (!debtToUpdate) return Alert.alert("Error", "Debt not found");

      const updatedDebt = {
        userId,
        creditor: debtToUpdate.creditor,
        amount: debtToUpdate.amount,
        dueDate: debtToUpdate.dueDate.toISOString(),
        status: newStatus
      };

      await updateDebt(debtId, updatedDebt);

      // ✅ Actualiza solo esa deuda en el estado local para renderizar
      setDebts(prev =>
        prev.map(d => d.id === debtId ? { ...d, status: newStatus } : d)
      );
    } catch (err) {
      console.error(err);
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
    setError('');
  };

  if (loading) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <View style={styles.container}>

      <View>
        {/* Selector de Mes */}
        <ScrollView ref={monthScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.monthTabs}>
          {months.map((month, index) => (
            <TouchableOpacity key={index} onPress={() => handleSelectMonth(new Date(month.date))}>
              <Text style={[styles.monthItem, isSameMonth(selectedDate, month.date) && styles.activeMonth]}>
                {month.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Resumen */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Debts</Text>
          <Text style={styles.summaryAmount}>${totalAmount.toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>This Month</Text>
        </View>
      </View>

      {/* Tabla de deudas */}
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
                  <Text style={{ color: debt.status === "OVERDUE" ? '#FF3B30' : debt.status === "PAID" ? '#34C759' : '#007AFF' }}>
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
                    {/* Si está pendiente, permitir marcar como pagado o cancelado */}
                    {debt.status === "PENDING" && (
                      <>
                        <Menu.Item onPress={() => handleUpdateDebtStatus(debt.id, "PAID")} title="Mark as Paid" />
                        <Menu.Item onPress={() => handleUpdateDebtStatus(debt.id, "CANCELLED")} title="Cancel Debt" />
                      </>
                    )}

                    {/* ✅ SOLO cuando NO sea PENDING se muestra opción de eliminar */}
                    {debt.status !== "PENDING" && (
                      <Menu.Item onPress={() => handleDeleteDebt(debt.id)} title="Delete" />
                    )}
                  </Menu>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </ScrollView>
        </DataTable>
      </View>

      {/* Botón de agregar deuda */}
      <Button mode="contained" onPress={openModal} style={styles.addButton}>Add Debt</Button>

      {/* Modal de creación */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>New Debt</Text>

          <TextInput
            label="Creditor"
            value={newDebt.creditor}
            onChangeText={text => handleDebtChange('creditor', text)}
            style={styles.input}
          />

          <TextInput
            label="Amount"
            value={newDebt.amount}
            onChangeText={text => handleDebtChange('amount', text)}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* 📅 DatePicker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              label="Due Date (Payment Deadline)"
              value={new Date(newDebt.dueDate).toLocaleDateString()}
              editable={false}
              style={styles.input}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(newDebt.dueDate)}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
    justifyContent: 'flex-start' // 🔥 Mantiene todo arriba
  },
  monthTabs: { flexDirection: 'row', marginBottom: 20 },
  monthItem: { marginHorizontal: 16, fontSize: 16, color: '#666' },
  activeMonth: { color: '#41416e', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#00C897' },
  summaryCard: {
    backgroundColor: '#41416e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16, // 🔥 Reducido para menos separación
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
    marginBottom: 16, // 🔥 Ajustado
  },
  tableHeader: { backgroundColor: '#f1f3f5' },
  tableHeaderText: { fontWeight: 'bold', color: '#41416e' },
  tableRow: { borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  tableCell: { color: '#495057', fontSize: 14 },
  addButton: {
    backgroundColor: '#00C897',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16 // 🔥 Espacio antes del final
  },
  modal: { backgroundColor: '#fff', padding: 24, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#41416e', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});