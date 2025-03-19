import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function ExpenseTracker() {
  return (
    <View style={styles.container}>
      <Text>Expense Tracker Personal</Text>
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
})