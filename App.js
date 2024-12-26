import 'react-native-gesture-handler';
//import LoginScreen from "./src/Screens/LoginScreen";
//import RegisterScreen from "./src/Screens/RegisterScreen";
import {createStackNavigator} from "@react-navigation/stack";
import HomeScreen from './src/Screens/HomeScreen';
import {NavigationContainer} from "@react-navigation/native";
import LoginScreen from "./src/Screens/LoginScreen";
import RegisterScreen from "./src/Screens/RegisterScreen";
import MapScreen from './src/Screens/MapScreen';
export default function App() {
  const Stack = createStackNavigator();
  return (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen}/>
      <Stack.Screen name="Login" component={LoginScreen}/>
      <Stack.Screen name="Register" component={RegisterScreen}/>
      <Stack.Screen name="Map" component={MapScreen}/>
    </Stack.Navigator>
  </NavigationContainer>
  );
}