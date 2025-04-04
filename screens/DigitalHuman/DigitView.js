import React from 'react';
import { BlurView } from "@react-native-community/blur"
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
  } from "react-native"
  
const { width } = Dimensions.get("window")

export const DigitView = () => {
    return (
    <View style={styles.digitalHumanContainer}>
        <BlurView style={styles.blurView} blurType="light" blurAmount={5} reducedTransparencyFallbackColor="white">
          <Image source={require("../../assets/model.png")} style={styles.digitalHuman} />
          {/* <LottieView
            ref={animation}
            source={require("../assets/digital-human.json")}
            style={styles.digitalHuman}
            autoPlay
            loop
          /> */}
        </BlurView>
      </View>
    )
}

const styles = StyleSheet.create({
    digitalHumanContainer: {
        height: "90%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      },
      blurView: {
        width: "100%",
        height: "100%",
       
      },
      digitalHuman: {
        width: width,
        height: width,
      },
})
