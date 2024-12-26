import 'react-native-gesture-handler';
import {createStackNavigator} from "@react-navigation/stack";
import HomeScreen from './src/Screens/HomeScreen';
import {NavigationContainer} from "@react-navigation/native";
import LoginScreen from "./src/Screens/LoginScreen";
import RegisterScreen from "./src/Screens/RegisterScreen";
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const Stack = createStackNavigator();
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
          <Stack.Screen name="Home" component={HomeScreen}/>
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="Register" component={RegisterScreen}/>
          <Stack.Screen name="MainApp" component={AppNavigator}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}