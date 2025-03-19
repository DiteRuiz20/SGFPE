import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import React from 'react'

export default function PersonalSignUp({navigation}) {
  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/logo.png')} style={styles.image} />

      <View style={{marginBottom: 20, alignItems: 'center'}}>
        <Text style={styles.subtitle}>Thanks for joining us!</Text>
        <Text style={styles.subtitle}>Please fill out the required data about your business.</Text>
      </View>

      <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#A9A9A9"/>
      <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#A9A9A9" keyboardType='email-address'/>
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#A9A9A9" secureTextEntry />

      <TouchableOpacity style={styles.secondary_button} onPress={() => 
        {Alert.alert(
          "Registration Successful",
          "Your account has been created successfully. Now you can login.",
          [{ text: "Got it!", onPress: navigation.goBack() }]
        );}
      }>
        <Text style={styles.button_text}>SIGN UP</Text>
      </TouchableOpacity>

      <View style={{marginTop: 25, alignItems: 'center'}}>
        <Text style={styles.subtitle}>Note:</Text>
        <Text style={styles.subtitle}>You will be sent a confirmation code via email, which will be used to authenticate your account.</Text>
      </View>
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
    marginBottom: 6,
    textAlign: 'center',
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
    marginTop: 15,
  },
  button_text: {
    color: 'white',
    fontSize: 16,
  },
})