// screens/PersonalSignUp.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUser } from '../../../src/api/axios';
import { validateField } from '../../InputValidator';

export default function PersonalSignUp() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    const fieldType = field === 'name' ? 'nameOrDescription' : field;
    const validation = validateField(fieldType, value);

    setErrors(prev => ({
      ...prev,
      [field]: validation.valid ? null : validation.message,
    }));
  };

  const handleSignUp = async () => {
    const { name, email, phoneNumber, password } = form;

    const validations = {
      name: validateField('nameOrDescription', name),
      email: validateField('email', email),
      phoneNumber: validateField('phoneNumber', phoneNumber),
      password: validateField('password', password),
    };

    const newErrors = {};
    Object.keys(validations).forEach(key => {
      if (!validations[key].valid) newErrors[key] = validations[key].message;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await createUser({ ...form, accountType: 'personal' });
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta fue creada correctamente. Ahora verifica tu email.',
        [{
          text: 'Entendido',
          onPress: () => navigation.navigate('VerifyAccount', { email, accountType: 'personal' })
        }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SGFPE</Text>
      <Image source={require('../../../assets/logo.png')} style={styles.image} />
      <Text style={styles.subtitle}>Crear cuenta personal</Text>

      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Nombre completo"
        placeholderTextColor="#A9A9A9"
        value={form.name}
        onChangeText={(text) => handleChange('name', text)}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Correo electrónico"
        placeholderTextColor="#A9A9A9"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => handleChange('email', text)}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, errors.phoneNumber && styles.inputError]}
        placeholder="Número telefónico"
        placeholderTextColor="#A9A9A9"
        keyboardType="number-pad"
        value={form.phoneNumber}
        onChangeText={(text) => handleChange('phoneNumber', text)}
      />
      {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Contraseña"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity style={styles.secondary_button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.button_text}>{loading ? 'Procesando...' : 'REGISTRARSE'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white', marginTop: -45 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#30437A', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#444', marginBottom: 20, textAlign: 'center' },
  image: { width: 130, height: 130, marginBottom: 30 },
  input: {
    width: '100%', backgroundColor: '#EAEAEA', padding: 15, borderRadius: 8, marginBottom: 10,
    shadowColor: '#888', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 2,
  },
  inputError: { borderColor: 'red', borderWidth: 1 },
  errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 8, marginTop: -6 },
  secondary_button: {
    width: '100%', backgroundColor: '#3DC9A7', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15,
    shadowColor: '#3dc1ad', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 2,
  },
  button_text: { color: 'white', fontSize: 16 },
});
