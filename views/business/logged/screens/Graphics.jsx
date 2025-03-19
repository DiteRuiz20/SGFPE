import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Graphics() {
  return (
    <View style={styles.container}>
      <Text>Graphics Business</Text>
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