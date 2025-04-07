// Adaptación del componente NewProductOrderTracker para React Native
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import MonthSelector from '../../../MonthSelector';
import { getNewProductExpensesByUser, getNewProductOrdersByUserId, createNewProductOrder } from '../.././../../src/api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NewProductOrderTrackerMobile() {
  const [orders, setOrders] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [form, setForm] = useState({ orderDescription: '', income: '', items: [] });
  const [showForm, setShowForm] = useState(false);

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
      setAvailableProducts(res.data || []);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleCreateOrder = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId || !form.orderDescription || !form.income || form.items.length === 0) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }

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
      setShowForm(false);
      fetchOrders();
    } catch (error) {
      console.error('Error al crear orden:', error);
      Alert.alert('Error', 'No se pudo crear la orden.');
    }
  };

  const filteredOrders = orders.filter(order => isSameMonth(order.orderDate, selectedMonth));
  const totalNetProfit = filteredOrders.reduce((sum, order) => sum + (order.netProfit || 0), 0);

  return (
    <View style={styles.container}>
      <View>
        <MonthSelector selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
        <Text style={styles.subtitle}>Ganancia total: ${totalNetProfit.toFixed(2)}</Text>
      </View>
      <FlatList
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
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
        <Text style={styles.addButtonText}>+ NUEVA ORDEN</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Descripción del pedido"
            value={form.orderDescription}
            onChangeText={(text) => setForm({ ...form, orderDescription: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Ingreso ($)"
            keyboardType="numeric"
            value={form.income}
            onChangeText={(text) => setForm({ ...form, income: text })}
          />

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
              }}>
              <Text>{product.productDescription} - {product.quantity} disponibles</Text>
            </TouchableOpacity>
          ))}

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
                }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
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