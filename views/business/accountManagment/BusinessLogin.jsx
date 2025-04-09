import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { Divider } from 'react-native-elements'
import { useAuth } from '../../../src/auth/AuthContext'
import { validateField } from '../../InputValidator'
import { ScrollView } from 'react-native-gesture-handler'

export default function BusinessLogin({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();

  const handleLogin = async () => {
    const emailValidation = validateField('email', username);
    const passwordValidation = validateField('password', password);

    const newErrors = {};
    if (!emailValidation.valid) newErrors.username = emailValidation.message;
    if (!passwordValidation.valid) newErrors.password = passwordValidation.message;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await login(username, password, 'business-raw-material');
      Alert.alert('Éxito', 'Inicio de sesión exitoso');
    } catch (error) {
      Alert.alert('Error', error.message || 'Correo o contraseña invalidos');
    }
  };

  return (
    <ScrollView style={{backgroundColor: '#fff'}} contentContainerStyle={{ flexGrow: 1 }}>
    <View style={styles.container}>
      <Text style={styles.title}>SGFPE</Text>
      <Image source={require('../../../assets/logo.png')} style={styles.image} />
      <Text style={styles.subtitle}>Empresarial Nueva Mercancía</Text>

      <TextInput
        style={[styles.input, errors.username && styles.inputError]}
        placeholder="Correo electrónico"
        placeholderTextColor="#A9A9A9"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          const validation = validateField('email', text);
          setErrors(prev => ({
            ...prev,
            username: validation.valid ? null : validation.message,
          }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Contraseña"
        placeholderTextColor="#A9A9A9"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          const validation = validateField('password', text);
          setErrors(prev => ({
            ...prev,
            password: validation.valid ? null : validation.message,
          }));
        }}
        secureTextEntry
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity style={styles.primary_button} onPress={handleLogin}>
        <Text style={styles.button_text}>INGRESAR</Text>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <Text style={styles.orText}>or</Text>
      <Text style={styles.getStarted}>¿Aún no tienes una cuenta?</Text>

      <TouchableOpacity style={styles.secondary_button} onPress={() => navigation.navigate('Business Sign Up')}>
        <Text style={styles.button_text}>REGISTRARSE</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  image: {
    width: 130,
    height: 130,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#30437A',
    marginBottom: 20,
    marginTop: -40,
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
  primary_button: {
    width: '100%',
    backgroundColor: '#30437A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#30387a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: '#EAEAEA',
    marginVertical: 15,
  },
  orText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: 'white',
    top: -23,
  },
  getStarted: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
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
  },
  button_text: {
    color: 'white',
    fontSize: 16,
  },
  inputError: { borderColor: 'red', borderWidth: 1 },
  errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 8, marginTop: -6 },
  forgotPassword: { alignSelf: 'flex-end', color: '#30437A', fontSize: 14, marginTop: 18, fontWeight: '500' }
});
