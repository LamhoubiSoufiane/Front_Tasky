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
import { usePushNotifications } from "./usePushNotifications";

export default function App() {
	const Stack = createStackNavigator();

	useEffect(() => {
		store.dispatch(resetForms());
	}, []);

	const { expoPushToken, notification } = usePushNotifications();
	const data = JSON.stringify(notification, undefined, 2);
	return (
		<Provider store={store}>
			<SafeAreaProvider>
				<NavigationContainer>
					<Stack.Navigator
						initialRouteName="Home"
						screenOptions={{ headerShown: false }}>
						<Stack.Screen name="Home" component={HomeScreen} />
						<Stack.Screen name="Login" component={LoginScreen} />
						<Stack.Screen
							name="Register"
							component={RegisterScreen}
							options={{ lazy: true }}
						/>
						<Stack.Screen
							name="MainApp"
							component={AppNavigator}
							options={{ lazy: true }}
						/>
						<Stack.Screen
							name="Profile"
							component={ProfileScreen}
							options={{ lazy: true }}
						/>
						<Stack.Screen
							name="EditProfile"
							component={EditScreen}
							options={{ lazy: true }}
						/>
						<Stack.Screen
							name="Settings"
							component={SettingsScreen}
							options={{ lazy: true }}
						/>
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
