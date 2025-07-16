import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar,Platform} from "react-native"

//Import screens
import DigitalHumanScreen from "./screens/DigitalHumanScreen"
import MotionAssessmentScreen from "./screens/MotionAssessmentScreen"

import _updateConfig from "./update.json";
const { appKey } = _updateConfig[Platform.OS];
import { UpdateProvider, Pushy } from "react-native-update";
const pushyClient = new Pushy({
  appKey,
});
const Stack = createStackNavigator()

export default function App() {
  return (
    <UpdateProvider client={pushyClient}>
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f8ff" />
      <Stack.Navigator
        initialRouteName="DigitalHuman"
        screenOptions={{
            headerShown: false
       }}
      >
        {/* <Stack.Screen name="Home" component={HomeScreen} options={{ title: "康复医疗AI系统" }} /> */}
        <Stack.Screen name="DigitalHuman" component={DigitalHumanScreen} options={{ title: "数字人交互" }} />
        <Stack.Screen name="MotionAssessment" component={MotionAssessmentScreen} options={{ title: "动作评估" }} />
        {/* <Stack.Screen name="Recorder" component={RealtimeSpeechRecognition} options={{ title: "语音Test" }}/> */}
        
      </Stack.Navigator>
    </NavigationContainer>
    </UpdateProvider>
  )
}

