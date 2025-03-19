import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { Icon } from 'react-native-elements';
import { Divider } from 'react-native-elements'

export default function Profile({onLogOut}) {
  const handleLogOut = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [{ text: "Yes", onPress: () => { onLogOut(); }}, { text: "No", onPress: () => console.log("Cancelled") }]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "Are you sure you want to change your password?",
      [{ text: "Yes", onPress: () => console.log("Changing password")}, { text: "No", onPress: () => console.log("Cancelled") }]
    );
  };

  const handleUpdateInfo = () => {
    Alert.alert(
      "Update Info",
      "Are you sure you want to update your info?",
      [{ text: "Yes", onPress: () => console.log("Updating info")}, { text: "No", onPress: () => console.log("Cancelled") }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PROFILE</Text>

      <Icon style={{marginBottom:20}} name="account-circle" type="material" size={130} color="#888" />

      <TextInput style={styles.input} placeholder="Business Name" placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#A9A9A9" keyboardType='phone-pad' />
      <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#A9A9A9" keyboardType='email-address'/>
      <TextInput style={styles.input} placeholder="Address(Optional)" placeholderTextColor="#A9A9A9" />

      <View style={{marginTop: 25, alignItems: 'center', width: '100%', gap: 10}}>
        <TouchableOpacity style={styles.secondary_button} onPress={handleUpdateInfo}>
          <Text style={styles.button_text}>UPDATE INFO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primary_button} onPress={handleChangePassword}>
          <Text style={styles.button_text}>CHANGE PASSWORD</Text>
        </TouchableOpacity>
      </View>

      <Divider style={styles.divider} />

      <TouchableOpacity style={styles.logOut_button} onPress={handleLogOut}>
        <Text style={styles.button_text}>LOG OUT</Text>
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
    width: 70,
    height: 70,
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
  logOut_button: {
    width: '100%',
    backgroundColor: '#dd1e1e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#d11717',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    marginTop: 15,
  },
})