import { StyleSheet, View, Dimensions, Image } from "react-native"
import { RTCView } from "react-native-webrtc"
import { BlurView } from "@react-native-community/blur"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

export const DigitView = ({ videoRef, isConnected, remoteStream }) => {
  return (
    <View style={styles.digitalHumanContainer}>
      <BlurView style={styles.blurView} blurType="light" blurAmount={5} reducedTransparencyFallbackColor="white">
        {isConnected && remoteStream ? (
          <RTCView
            ref={videoRef}
            streamURL={remoteStream.toURL()}
            objectFit="none"
            style={[styles.digitalHuman, {
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              transform: [
                { scale: 4 },
                { translateX: SCREEN_WIDTH * 0.1 },
              ]
            }]}
          />
        ) : (
          <Image 
            source={require("../../assets/doctor.jpg")} 
            style={styles.placeholderImage}
            resizeMode="cover"
            onError={(error) => console.log('Image loading error:', error)}
            onLoad={() => console.log('Image loaded successfully')}
          />
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  blurView: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  digitalHuman: {
    flex: 1,
  },
  placeholderImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignSelf: 'center',
  },
})