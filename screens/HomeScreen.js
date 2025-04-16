import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from "react-native"
import { BlurView } from "@react-native-community/blur"

const HomeScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require("../assets/background.png")} style={styles.background}>
      <BlurView style={styles.blurContainer} blurType="light" blurAmount={10} reducedTransparencyFallbackColor="white">
        <View style={styles.container}>
          <Text style={styles.title}>康途向导</Text>
          <Text style={styles.subtitle}>智能辅助您的康复之旅</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("DigitalHuman")}>
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>数字人交互</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MotionAssessment")}>
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>动作评估</Text>
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Recorder")}>
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>语音Test</Text>
              </View>
            </TouchableOpacity> */}
          </View>
        </View>
      </BlurView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  blurContainer: {
    flex: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  buttonInner: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
})

export default HomeScreen

