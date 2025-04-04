"use client"

import { useState, useRef } from "react"
import {
  StyleSheet,
  View,

} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { DigitView } from './DigitalHuman/DigitView'
import ChatView from './DigitalHuman/ChatView'
const DigitalHumanScreen = () => {


  return (
    <View style={styles.container}>
      <DigitView/>
      <ChatView/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
})

export default DigitalHumanScreen

