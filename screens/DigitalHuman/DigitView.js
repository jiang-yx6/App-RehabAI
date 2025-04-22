import { StyleSheet, View, Dimensions, Image } from "react-native"
import { RTCView } from "react-native-webrtc"
import { BlurView } from "@react-native-community/blur"

const { width } = Dimensions.get("window")
const { height } = Dimensions.get("window")

export const DigitView = ({ videoRef, isConnected, remoteStream }) => {
  return (
    <View style={styles.digitalHumanContainer}>
      <BlurView style={styles.blurView} blurType="light" blurAmount={5} reducedTransparencyFallbackColor="white">
        {isConnected && remoteStream ? (
          <RTCView
            ref={videoRef}
            streamURL={remoteStream.toURL()}
            objectFit="cover"
            style={[styles.digitalHuman,{
            }]}
            zOrder={0}
            mirror={false}
          />
        ) : (
          <Image source={require("../../assets/doctor.jpg")} style={styles.digitalHuman} />
        )}
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  digitalHumanContainer: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  blurView: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  digitalHuman: {
    width: width,
    height: height,
    
  },
})