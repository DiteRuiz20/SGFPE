import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getNewProductExpensesByUser, createNewProductExpense } from '../../../../src/api/axios';
import { DataTable, Portal, Modal, Button, HelperText, Menu } from 'react-native-paper';
import { Input } from '@rneui/base';
import MonthSelector from '../../../MonthSelector';
import { validateField } from '../../../InputValidator';
import { useIsFocused } from '@react-navigation/native';

export default function NewProductTracker() {
  const { userId } = useAuth();
  const monthScrollRef = useRef(null);
  const isFocused = useIsFocused();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [months, setMonths] = useState([]);
  // Agrega un estado para el ancla
  const [anchorPosition, setAnchorPosition] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    productDescription: '',
    quantity: '',
    unitCost: '',
    category: '',
    paymentMethod: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const [menuVisible, setMenuVisible] = useState(false);
  const selectButtonRef = useRef();
  const paymentOptions = ['Transferencia', 'Efectivo', 'Tarjeta'];

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
    if (isFocused) fetchProducts();
  }, [isFocused]);

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
    const { productDescription, quantity, unitCost, category, paymentMethod } = form;
    const errors = {};

    const descriptionValidation = validateField('nameOrDescription', productDescription);
    const quantityValidation = validateField('positiveInteger', quantity);
    const unitCostValidation = validateField('positiveNumber', unitCost);

    if (!descriptionValidation.valid) errors.productDescription = descriptionValidation.message;
    if (!quantityValidation.valid) errors.quantity = quantityValidation.message;
    if (!unitCostValidation.valid) errors.unitCost = unitCostValidation.message;
    if (!paymentMethod) errors.paymentMethod = 'Selecciona un método de pago';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createNewProductExpense({
        ...form,
        quantity: parseFloat(form.quantity),
        unitCost: parseFloat(form.unitCost),
        totalCost: parseFloat(form.unitCost) * parseFloat(form.quantity),
        userId,
        purchaseDate: new Date().toISOString()
      });
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    setFormErrors({});
  };

  const closeModal = () => {
    setModalVisible(false);
    setForm({
      productDescription: '',
      quantity: '',
      unitCost: '',
      category: '',
      paymentMethod: ''
    });
    setFormErrors({});
  };

  return (
    <View style={styles.container}>
      <View>
        <MonthSelector
          selectedMonth={selectedDate}
          onSelectMonth={(date) => setSelectedDate(date)}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Gasto Total</Text>
          <Text style={styles.summaryAmount}>
            ${filteredProducts.reduce((acc, p) => acc + (p.totalCost || 0), 0).toFixed(2)}
          </Text>
          <Text style={styles.summarySubtext}>Este mes</Text>
        </View>
      </View>

      <Button mode="contained" onPress={openModal} style={styles.addButton}>Agregar Producto</Button>

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Nuevo Producto</Text>

          <Input
            label="Descripción"
            placeholder="Ej. Cajas de cartón"
            onChange={({ nativeEvent: { text } }) => {
              setForm(prev => ({ ...prev, productDescription: text }));
              const result = validateField('nameOrDescription', text);
              setFormErrors(prev => ({ ...prev, productDescription: result.valid ? '' : result.message }));
            }}
            errorMessage={formErrors.productDescription}
          />

          <Input
            label="Cantidad"
            placeholder="Ej. 100"
            keyboardType="numeric"
            onChange={({ nativeEvent: { text } }) => {
              setForm(prev => ({ ...prev, quantity: text }));
              const result = validateField('positiveInteger', text);
              setFormErrors(prev => ({ ...prev, quantity: result.valid ? '' : result.message }));
            }}
            errorMessage={formErrors.quantity}
          />

          <Input
            label="Costo unitario"
            placeholder="Ej. 20.50"
            keyboardType="numeric"
            onChange={({ nativeEvent: { text } }) => {
              setForm(prev => ({ ...prev, unitCost: text }));
              const result = validateField('positiveNumber', text);
              setFormErrors(prev => ({ ...prev, unitCost: result.valid ? '' : result.message }));
            }}
            errorMessage={formErrors.unitCost}
          />

          <Input
            label="Categoría"
            placeholder="Ej. Empaque"
            onChange={({ nativeEvent: { text } }) => setForm(prev => ({ ...prev, category: text }))}
          />

          <Text style={styles.label}>Método de pago</Text>
          <View
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              setAnchorPosition({ x, y: y + height }); // posición bajo el botón
            }}
          >
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.selectButton}
            >
              <Text style={styles.selectButtonText}>
                {form.paymentMethod || 'Selecciona un método de pago'}
              </Text>
            </TouchableOpacity>
          </View>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={anchorPosition}
          >


            {paymentOptions.map((option) => (
              <Menu.Item
                key={option}
                title={option}
                onPress={() => {
                  setForm(prev => ({ ...prev, paymentMethod: option }));
                  setMenuVisible(false);
                  setFormErrors(prev => ({ ...prev, paymentMethod: '' }));
                }}
              />
            ))}
          </Menu>

          {formErrors.paymentMethod ? <HelperText type="error">{formErrors.paymentMethod}</HelperText> : null}

          <View style={styles.modalButtons}>
            <Button onPress={closeModal}>Cancelar</Button>
            <Button mode="contained" onPress={handleCreateProduct}>Guardar</Button>
          </View>
        </Modal>
      </Portal>

      {filteredProducts.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hay registros este mes.</Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
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
  label: { fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  selectButton: {
    backgroundColor: '#f1f3f5',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8
  },
  selectButtonText: {
    color: '#495057',
    fontSize: 16
  },
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
