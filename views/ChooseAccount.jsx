import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'

export default function ChooseAccount ({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.image} />

      <Text style={styles.title}>What type of account do you want to create?</Text>

      <TouchableOpacity  style={styles.primary_button} onPress={() => navigation.navigate('Business Type')}>
        <Text style={styles.buttonText}>BUSINESS</Text>
      </TouchableOpacity>

      <TouchableOpacity  style={styles.secondary_button} onPress={() => navigation.navigate('Personal')}>
        <Text style={styles.buttonText}>PERSONAL</Text>
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