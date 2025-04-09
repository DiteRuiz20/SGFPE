import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'

export default function BusinessType({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/logo.png')} style={styles.image} />

      <Text style={styles.title}>¿Qué tipo de empresa eres?</Text>

      <TouchableOpacity style={styles.primary_button} onPress={() => navigation.navigate('Business Login', { accountType: 'business-raw-material' })}>
        <Text style={styles.buttonText}>MATERIA PRIMA</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondary_button} onPress={() => navigation.navigate('BusinessNewProductExpenseLogin', { accountType: 'business-new-product-expense' })}>
        <Text style={styles.buttonText}>NUEVA MERCANCÍA</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginTop: -50,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
    maxWidth: '100%',
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
  buttonText: {
    color: 'white', 
    fontSize: 16,
  },
})