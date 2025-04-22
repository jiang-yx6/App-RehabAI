import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar ,View,Text} from "react-native"

//Import screens
import HomeScreen from "./screens/HomeScreen"
import DigitalHumanScreen from "./screens/DigitalHumanScreen"
import MotionAssessmentScreen from "./screens/MotionAssessmentScreen"
import RealtimeSpeechRecognition from "./screens/ASR/RealtimeSpeechRecognition"
const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f8ff" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
            // headerStyle: {
            //     backgroundColor: "#3b82f6",
            //     },
            // headerTintColor: "#fff",
            // headerTitleStyle: {
            //         fontWeight: "bold",
            //       },
            // cardStyle: { backgroundColor: "#f0f8ff" },
            headerShown: false
       }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "康复医疗AI系统" }} />
        <Stack.Screen name="DigitalHuman" component={DigitalHumanScreen} options={{ title: "数字人交互" }} />
        <Stack.Screen name="MotionAssessment" component={MotionAssessmentScreen} options={{ title: "动作评估" }} />
        <Stack.Screen name="Recorder" component={RealtimeSpeechRecognition} options={{ title: "语音Test" }}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  )
}

