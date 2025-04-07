import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createUser } from '../../../src/api/axios';

export default function PersonalSignUp() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    const { name, email, phoneNumber, password } = form;
    if (!name || !email || !phoneNumber || !password) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

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
      console.error('Error al crear la cuenta:', error);
      let message = 'Ocurrió un error. Intenta de nuevo más tarde.';
      if (error?.response?.status === 409) {
        message = 'El correo ya está registrado.';
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/logo.png')} style={styles.image} />

      <View style={{ marginBottom: 20, alignItems: 'center' }}>
        <Text style={styles.subtitle}>Thanks for joining us!</Text>
        <Text style={styles.subtitle}>Please fill out the required data about your business.</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#A9A9A9"
        onChangeText={(text) => handleChange('name', text)}
        value={form.name}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#A9A9A9"
        keyboardType="email-address"
        onChangeText={(text) => handleChange('email', text)}
        value={form.email}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#A9A9A9"
        keyboardType="phone-pad"
        onChangeText={(text) => handleChange('phoneNumber', text)}
        value={form.phoneNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
        onChangeText={(text) => handleChange('password', text)}
        value={form.password}
      />

      <TouchableOpacity style={styles.secondary_button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.button_text}>{loading ? 'PROCESSING...' : 'SIGN UP'}</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 25, alignItems: 'center' }}>
        <Text style={styles.subtitle}>Note:</Text>
        <Text style={styles.subtitle}>
          You will be sent a confirmation code via email, which will be used to authenticate your account.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginTop: -45,
  },
  image: {
    width: 130,
    height: 130,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  secondary_button: {
    width: '100%',
    backgroundColor: '#3DC9A7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#3dc1ad',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    marginTop: 15,
  },
  button_text: {
    color: 'white',
    fontSize: 16,
  },
});
