// Adaptación del componente NewProductOrderTracker para React Native con validación por campo
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import MonthSelector from '../../../MonthSelector';
import { getNewProductExpensesByUser, getNewProductOrdersByUserId, createNewProductOrder } from '../.././../../src/api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateField } from '../../../InputValidator';
import { useIsFocused } from '@react-navigation/native';

export default function NewProductOrderTrackerMobile() {
  const [orders, setOrders] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [form, setForm] = useState({ orderDescription: '', income: '', items: [] });
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const isFocused = useIsFocused();

  const isSameMonth = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
  };

  const fetchOrders = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;
    try {
      const response = await getNewProductOrdersByUserId(userId);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
    }
  };

  const fetchProducts = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      const res = await getNewProductExpensesByUser(userId);
      const available = (res.data || []).filter(p => p.quantity > 0);
      setAvailableProducts(available);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused]);

  const handleCreateOrder = async () => {
    const userId = await AsyncStorage.getItem('userId');
    const errors = {};

    const descValidation = validateField('nameOrDescription', form.orderDescription);
    const incomeValidation = validateField('positiveNumber', form.income);

    if (!descValidation.valid) errors.orderDescription = descValidation.message;
    if (!incomeValidation.valid) errors.income = incomeValidation.message;
    if (form.items.length === 0) errors.items = 'Agrega al menos un producto';

    for (let item of form.items) {
      const product = availableProducts.find(p => p.id === item.productId);
      if (!product || item.quantity > product.quantity) {
        errors.items = `No hay suficientes unidades de "${item.productDescription}"`;
        break;
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        userId,
        orderDescription: form.orderDescription,
        income: parseFloat(form.income),
        items: form.items.map(item => ({
          productId: item.productId,
          productDescription: item.productDescription,
          quantity: item.quantity,
          unitCost: item.unitCost,
        }))
      };

      await createNewProductOrder(payload);
      Alert.alert('Éxito', 'Orden creada con éxito.');
      setForm({ orderDescription: '', income: '', items: [] });
      setFormErrors({});
      setShowForm(false);
      fetchOrders();
      fetchProducts();
    } catch (error) {
      console.error('Error al crear orden:', error);
      Alert.alert('Error', 'No se pudo crear la orden.');
    }
  };

  const filteredOrders = orders.filter(order => isSameMonth(order.orderDate, selectedMonth));
  const totalNetProfit = filteredOrders.reduce((sum, order) => sum + (order.netProfit || 0), 0);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ListHeaderComponent={
          <>
            <MonthSelector selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
            <Text style={styles.subtitle}>Ganancia total: ${totalNetProfit.toFixed(2)}</Text>

            <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
              <Text style={styles.addButtonText}>+ NUEVA ORDEN</Text>
            </TouchableOpacity>

            {showForm && (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Descripción del pedido"
                  value={form.orderDescription}
                  onChangeText={(text) => {
                    setForm(prev => ({ ...prev, orderDescription: text }));
                    const result = validateField('nameOrDescription', text);
                    setFormErrors(prev => ({ ...prev, orderDescription: result.valid ? '' : result.message }));
                  }}
                />
                {formErrors.orderDescription ? <Text style={{ color: 'red' }}>{formErrors.orderDescription}</Text> : null}

                <TextInput
                  style={styles.input}
                  placeholder="Ingreso ($)"
                  keyboardType="numeric"
                  value={form.income}
                  onChangeText={(text) => {
                    setForm(prev => ({ ...prev, income: text }));
                    const result = validateField('positiveNumber', text);
                    setFormErrors(prev => ({ ...prev, income: result.valid ? '' : result.message }));
                  }}
                />
                {formErrors.income ? <Text style={{ color: 'red' }}>{formErrors.income}</Text> : null}

                <Text style={styles.label}>Agregar productos:</Text>
                {availableProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productItem}
                    onPress={() => {
                      const exists = form.items.find(i => i.productId === product.id);
                      if (exists) return;
                      setForm(prev => ({
                        ...prev,
                        items: [...prev.items, {
                          productId: product.id,
                          productDescription: product.productDescription,
                          quantity: 1,
                          unitCost: product.unitCost,
                        }]
                      }));
                    }}
                  >
                    <Text>{product.productDescription} - {product.quantity} disponibles</Text>
                  </TouchableOpacity>
                ))}
                {formErrors.items ? <Text style={{ color: 'red', marginTop: 4 }}>{formErrors.items}</Text> : null}

                <Text style={styles.label}>Productos en orden:</Text>
                {form.items.map((item, index) => (
                  <View key={index} style={styles.selectedProduct}>
                    <Text style={{ flex: 1 }}>{item.productDescription}</Text>
                    <TextInput
                      style={styles.quantityInput}
                      keyboardType="numeric"
                      value={item.quantity.toString()}
                      onChangeText={(value) => {
                        const updated = [...form.items];
                        updated[index].quantity = parseInt(value) || 1;
                        setForm({ ...form, items: updated });
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setForm(prev => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <Text style={{ color: 'red' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.buttonsRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.submitButton} onPress={handleCreateOrder}>
                    <Text style={styles.buttonText}>Registrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        }
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.cardText}>{item.orderDescription}</Text>
            <Text>Ingreso: ${item.income}</Text>
            <Text>Costo total: ${item.totalOrderCost}</Text>
            <Text>Ganancia neta: ${item.netProfit}</Text>
            <Text>Fecha: {new Date(item.orderDate).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noData}>No hay órdenes este mes.</Text>}
        contentContainerStyle={{ padding: 20 }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#30437A', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#333', textAlign: 'center', marginVertical: 10 },
  orderCard: { padding: 15, marginBottom: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  cardText: { fontWeight: 'bold', fontSize: 16 },
  noData: { textAlign: 'center', color: 'gray', marginTop: 20 },
  addButton: { backgroundColor: '#3DC9A7', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  formContainer: { marginTop: 30, backgroundColor: '#f9f9f9', padding: 20, borderRadius: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  productItem: { padding: 10, backgroundColor: '#eaeaea', borderRadius: 6, marginTop: 5 },
  selectedProduct: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  quantityInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, width: 50, marginHorizontal: 10, padding: 5, textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { backgroundColor: '#ddd', padding: 10, borderRadius: 6, width: '45%', alignItems: 'center' },
  submitButton: { backgroundColor: '#30437A', padding: 10, borderRadius: 6, width: '45%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});