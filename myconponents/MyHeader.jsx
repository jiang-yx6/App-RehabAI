import { Text, StyleSheet, View } from 'react-native'
import React, { Component } from 'react'

export default class MyHeader extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.headerFont}>Lumo</Text>
        <Text style={styles.headerHello}>有什么我可以帮助你的吗？</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    container:{
        marginTop: 10,
        marginLeft: 20,
    },
    headerFont:{
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerHello:{
        fontSize: 15,
    }
})