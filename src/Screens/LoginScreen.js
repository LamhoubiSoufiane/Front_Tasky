import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useDispatch, useSelector } from "react-redux";
import { login, setLoginForm } from "../Redux/actions/authActions";
import Toast from "react-native-toast-message";

export default function LoginScreen({ navigation }) {
	const dispatch = useDispatch();
	const { loginForm, loading, error } = useSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);

	const validateForm = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(loginForm.email?.trim())) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Veuillez entrer une adresse email valide",
				position: "top",
				visibilityTime: 3000,
			});
			return false;
		}

		if (!loginForm.email?.trim() || !loginForm.password?.trim()) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Veuillez remplir tous les champs",
				position: "top",
				visibilityTime: 3000,
			});
			return false;
		}

		if (loginForm.password.trim().length < 6) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Le mot de passe doit contenir au moins 6 caractères",
				position: "top",
				visibilityTime: 3000,
			});
			return false;
		}

		return true;
	};

	const handleLogin = async () => {
		if (!validateForm()) return;

		try {
			const credentials = {
				email: loginForm.email.trim(),
				password: loginForm.password.trim(),
			};

			const result = await dispatch(login(credentials));

			if (result && result.success) {
				navigation.replace("MainApp");
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: result.message || "Connexion réussie",
					position: "top",
					visibilityTime: 2000,
				});
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result?.error || "Une erreur est survenue lors de la connexion",
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Login error:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Une erreur est survenue lors de la connexion",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	const handleInputChange = (field, value) => {
		dispatch(setLoginForm(field, value));
	};

	return (
		<LinearGradient
			colors={["#4c669f", "#3b5998", "#192f6a"]}
			style={styles.container}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<MaterialIcons name="arrow-back" size={24} color="#fff" />
				</TouchableOpacity>
				<View style={styles.header}>
					<Animatable.Image
						animation="bounceIn"
						duration={1500}
						source={require("../../assets/logo.jpeg")}
						style={styles.logo}
						resizeMode="contain"
					/>
				</View>

				<Animatable.View animation="fadeInUpBig" style={styles.footer}>
					<Text style={styles.title}>Welcome Back!</Text>

					<View style={styles.inputContainer}>
						<MaterialIcons name="email" size={20} color="#666" style={styles.icon} />
						<TextInput
							placeholder="Email"
							style={styles.input}
							value={loginForm.email}
							onChangeText={(value) => handleInputChange("email", value)}
							autoCapitalize="none"
						/>
					</View>

					<View style={styles.inputContainer}>
						<MaterialIcons name="lock" size={20} color="#666" style={styles.icon} />
						<TextInput
							placeholder="Password"
							style={styles.input}
							value={loginForm.password}
							onChangeText={(value) => handleInputChange("password", value)}
							secureTextEntry={!showPassword}
						/>
						<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
							<MaterialIcons
								name={showPassword ? "visibility" : "visibility-off"}
								size={20}
								color="#666"
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
						<Text style={styles.forgotPassword}>Forgot password?</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.loginButton}
						onPress={handleLogin}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.loginText}>Login</Text>
						)}
					</TouchableOpacity>

					<View style={styles.registerContainer}>
						<Text style={styles.registerText}>Don't have an account? </Text>
						<TouchableOpacity onPress={() => navigation.navigate("Register")}>
							<Text style={styles.registerLink}>Register</Text>
						</TouchableOpacity>
					</View>
				</Animatable.View>
			</KeyboardAvoidingView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backButton: {
		position: "absolute",
		top: 40,
		left: 20,
	},
	header: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 50,
	},
	footer: {
		flex: 3,
		backgroundColor: "#fff",
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	logo: {
		width: 120,
		height: 120,
		marginBottom: 20,
		borderRadius: 60,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 5,
		elevation: 5,
		top: 50,
	},
	title: {
		color: "#333",
		fontSize: 30,
		fontWeight: "bold",
		marginBottom: 30,
	},
	inputContainer: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#f2f2f2",
		paddingBottom: 5,
		marginBottom: 25,
		alignItems: "center",
	},
	icon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		paddingVertical: 0,
		color: "#333",
		fontSize: 16,
	},
	forgotPassword: {
		color: "#666",
		marginBottom: 30,
		textAlign: "right",
	},
	loginButton: {
		backgroundColor: "#4c669f",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
	},
	loginText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	registerContainer: {
		flexDirection: "row",
		marginTop: 20,
		justifyContent: "center",
	},
	registerText: {
		color: "#666",
	},
	registerLink: {
		color: "#4c669f",
		fontWeight: "bold",
	},
});
