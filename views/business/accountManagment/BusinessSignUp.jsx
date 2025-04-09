import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { createUser } from '../../../src/api/axios';
import { useNavigation } from '@react-navigation/native';
import { validateField } from '../../InputValidator';

export default function BusinessSignUp() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    const type =
      field === 'email' ? 'email' :
        field === 'password' ? 'password' :
          field === 'phoneNumber' ? 'phoneNumber' :
            field === 'address' && value ? 'address' : 'nameOrDescription';

    const result = validateField(type, value);
    setFormErrors(prev => ({ ...prev, [field]: result.valid ? null : result.message }));
  };

  const validateForm = () => {
    const errors = {};
    const { name, phoneNumber, email, password, address } = form;

    const validations = {
      name: validateField('nameOrDescription', name),
      phoneNumber: validateField('phoneNumber', phoneNumber),
      email: validateField('email', email),
      password: validateField('password', password),
      address: address ? validateField('address', address) : { valid: true }
    };

    Object.entries(validations).forEach(([field, result]) => {
      if (!result.valid) errors[field] = result.message;
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const { name, phoneNumber, email, password, address } = form;

    try {
      setLoading(true);
      await createUser({
        name,
        phoneNumber,
        email: email.toLowerCase(),
        password,
        address,
        accountType: 'business-raw-material'
      });

      navigation.navigate('VerifyAccount', {
        email: email.toLowerCase(),
        accountType: 'business-raw-material'
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'Registration failed');
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

      <TextInput style={styles.input} placeholder="Business Name" placeholderTextColor="#A9A9A9"
        onChangeText={(text) => handleChange('name', text)} />
      {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#A9A9A9"
        keyboardType="phone-pad" onChangeText={(text) => handleChange('phoneNumber', text)} />
      {formErrors.phoneNumber && <Text style={styles.errorText}>{formErrors.phoneNumber}</Text>}

      <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#A9A9A9"
        autoCapitalize="none" keyboardType="email-address" onChangeText={(text) => handleChange('email', text)} />
      {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}

      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#A9A9A9"
        secureTextEntry onChangeText={(text) => handleChange('password', text)} />
      {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}

      <TextInput style={styles.input} placeholder="Address (Optional)" placeholderTextColor="#A9A9A9"
        onChangeText={(text) => handleChange('address', text)} />
      {formErrors.address && <Text style={styles.errorText}>{formErrors.address}</Text>}

      <TouchableOpacity style={styles.secondary_button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.button_text}>{loading ? 'Registering...' : 'SIGN UP'}</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 25, alignItems: 'center' }}>
        <Text style={styles.subtitle}>Note:</Text>
        <Text style={styles.subtitle}>You will be sent a confirmation code via email to authenticate your account.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white', marginTop: -45 },
  image: { width: 130, height: 130, marginBottom: 30 },
  subtitle: { fontSize: 14, color: '#444', marginBottom: 6, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#EAEAEA', padding: 15, borderRadius: 8, marginBottom: 10 },
  errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 6 },
  secondary_button: { width: '100%', backgroundColor: '#3DC9A7', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  button_text: { color: 'white', fontSize: 16 }
});
