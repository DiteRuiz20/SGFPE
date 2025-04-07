import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getNewProductExpensesByUser, createNewProductExpense } from '../../../../src/api/axios';
import { DataTable, Portal, Modal, TextInput, Button, HelperText } from 'react-native-paper';
import MonthSelector from '../../../MonthSelector';

export default function NewProductTracker() {
  const { userId } = useAuth();
  const monthScrollRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [months, setMonths] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    productDescription: '',
    quantity: '',
    unitCost: '',
    category: '',
    paymentMethod: '',
    notes: ''
  });
  const [error, setError] = useState('');

  const isSameMonth = (date1, date2) =>
    new Date(date1).getMonth() === new Date(date2).getMonth() &&
    new Date(date1).getFullYear() === new Date(date2).getFullYear();

  const fetchProducts = async () => {
    try {
      const res = await getNewProductExpensesByUser(userId);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error al obtener productos:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    generateMonths(new Date());
  }, []);

  useEffect(() => {
    const filtered = products.filter(p => isSameMonth(p.purchaseDate, selectedDate));
    setFilteredProducts(filtered);
  }, [products, selectedDate]);

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

  const handleCreateProduct = async () => {
    const { productDescription, quantity, unitCost } = form;
    if (!productDescription || !quantity || !unitCost) {
      return setError('Todos los campos obligatorios deben llenarse');
    }

    try {
      await createNewProductExpense({
        ...form,
        quantity: parseFloat(form.quantity),
        unitCost: parseFloat(form.unitCost),
        totalCost: parseFloat(form.unitCost) * parseFloat(form.quantity),
        userId,
        purchaseDate: new Date().toISOString(),
      });
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Error al crear el producto.');
    }
  };

  const openModal = () => {
    setModalVisible(true);
    setError('');
  };

  const closeModal = () => {
    setModalVisible(false);
    setForm({
      productDescription: '',
      quantity: '',
      unitCost: '',
      category: '',
      paymentMethod: '',
      notes: ''
    });
    setError('');
  };

  return (
    <View style={styles.container}>

      <View>
        {/* Selector de meses */}
        <MonthSelector
          selectedMonth={selectedDate}
          onSelectMonth={(date) => setSelectedDate(date)}
        />

        {/* Resumen simple */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Gasto Total</Text>
          <Text style={styles.summaryAmount}>
            ${filteredProducts.reduce((acc, p) => acc + (p.totalCost || 0), 0).toFixed(2)}
          </Text>
          <Text style={styles.summarySubtext}>Este mes</Text>
        </View>
      </View>


      {/* Botón agregar */}
      <Button mode="contained" onPress={openModal} style={styles.addButton}>Agregar Producto</Button>

      {/* Modal de registro */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Nuevo Producto</Text>
          <TextInput label="Descripción" value={form.productDescription} onChangeText={text => setForm({ ...form, productDescription: text })} style={styles.input} />
          <TextInput label="Cantidad" value={form.quantity} onChangeText={text => setForm({ ...form, quantity: text })} keyboardType="numeric" style={styles.input} />
          <TextInput label="Costo unitario" value={form.unitCost} onChangeText={text => setForm({ ...form, unitCost: text })} keyboardType="numeric" style={styles.input} />
          <TextInput label="Categoría" value={form.category} onChangeText={text => setForm({ ...form, category: text })} style={styles.input} />
          <TextInput label="Método de pago" value={form.paymentMethod} onChangeText={text => setForm({ ...form, paymentMethod: text })} style={styles.input} />
          <TextInput label="Notas" value={form.notes} onChangeText={text => setForm({ ...form, notes: text })} style={styles.input} />
          {error ? <HelperText type="error">{error}</HelperText> : null}
          <View style={styles.modalButtons}>
            <Button onPress={closeModal}>Cancelar</Button>
            <Button mode="contained" onPress={handleCreateProduct}>Guardar</Button>
          </View>
        </Modal>
      </Portal>

      {/* Tabla de productos */}
      <View style={styles.tableContainer}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title>Descripción</DataTable.Title>
            <DataTable.Title numeric>Cantidad</DataTable.Title>
            <DataTable.Title numeric>Total</DataTable.Title>
          </DataTable.Header>
          <ScrollView>
            {filteredProducts.map((p, idx) => (
              <DataTable.Row key={p.id || idx}>
                <DataTable.Cell>{p.productDescription}</DataTable.Cell>
                <DataTable.Cell numeric>{p.quantity}</DataTable.Cell>
                <DataTable.Cell numeric>${p.totalCost}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </ScrollView>
        </DataTable>
      </View>
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
    elevation: 4
  },
  summaryLabel: { color: '#fff', fontSize: 18, marginBottom: 6 },
  summaryAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  summarySubtext: { color: '#ddd', fontSize: 14 },

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
    borderRadius: 16
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#41416e', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },

  tableContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 30
  },
  tableHeader: {
    backgroundColor: '#f1f3f5'
  }
});
