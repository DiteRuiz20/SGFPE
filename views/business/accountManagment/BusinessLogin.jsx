import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { Divider } from 'react-native-elements'

export default function BusinessLogin({ navigation, onLoginBusiness }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await onLoginBusiness(username, password);
      Alert.alert('Success', 'Login successful');
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SGFPE</Text>
      <Image source={require('../../../assets/logo.png')} style={styles.image} />
      <Text style={styles.subtitle}>Gestión Financiera Empresarial</Text>

      <TextInput style={styles.input} placeholder="Email Address" value={username} onChangeText={setUsername} keyboardType='email-address' placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Password"  value={password} onChangeText={setPassword} placeholderTextColor="#A9A9A9" secureTextEntry />

      <TouchableOpacity style={styles.primary_button} onPress={handleLogin}>
        <Text style={styles.button_text}>LOGIN</Text>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <Text style={styles.orText}>or</Text>
      <Text style={styles.getStarted}>Sign up to get started</Text>

      <TouchableOpacity style={styles.secondary_button} onPress={() => navigation.navigate('Business Sign Up')}>
        <Text style={styles.button_text}>SIGN UP</Text>
      </TouchableOpacity>
    </View>
  )
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
})