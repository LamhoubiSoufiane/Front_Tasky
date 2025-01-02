import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/Screens/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "./src/Screens/LoginScreen";
import RegisterScreen from "./src/Screens/RegisterScreen";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProfileScreen from "./src/Screens/ProfileScreen";
import EditScreen from "./src/Screens/EditScreen";
import SettingsScreen from "./src/Screens/SettingsScreen";
import ChangePasswordScreen from "./src/Screens/ChangePasswordScreen";
import forgotPasswordScreen from "./src/Screens/ForgotPasswordScreen";
import { Provider } from "react-redux";
import store from "./src/Redux/store";
import Toast from "react-native-toast-message";
import React, { useEffect } from "react";
import { resetForms } from "./src/Redux/actions/authActions";

export default function App() {
	const Stack = createStackNavigator();

	useEffect(() => {
		// Réinitialiser les formulaires au démarrage
		store.dispatch(resetForms());
	}, []);

	return (
		<Provider store={store}>
			<SafeAreaProvider>
				<NavigationContainer>
					<Stack.Navigator
						initialRouteName="Home"
						screenOptions={{ headerShown: false }}>
						<Stack.Screen name="Home" component={HomeScreen} />
						<Stack.Screen name="Login" component={LoginScreen} />
						<Stack.Screen name="Register" component={RegisterScreen} />
						<Stack.Screen name="MainApp" component={AppNavigator} />
						<Stack.Screen name="Profile" component={ProfileScreen} />
						<Stack.Screen name="EditProfile" component={EditScreen} />
						<Stack.Screen name="Settings" component={SettingsScreen} />
						<Stack.Screen
							name="ChangePassword"
							component={ChangePasswordScreen}
						/>
						<Stack.Screen
							name="ForgotPassword"
							component={forgotPasswordScreen}
						/>
					</Stack.Navigator>
				</NavigationContainer>
				<Toast />
			</SafeAreaProvider>
		</Provider>
	);
}
