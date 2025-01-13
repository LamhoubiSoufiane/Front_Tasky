import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { login, setLoginForm } from "../Redux/actions/authActions";
import { colors } from "../assets/colors";
import Toast from "react-native-toast-message";

const LoginScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { loginForm, loading, error } = useSelector((state) => state.auth);

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

			console.log(credentials);

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
					text2:
						result?.error || "Une erreur est survenue lors de la connexion",
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
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled">
				<View style={styles.formContainer}>
					<Text style={styles.title}>Connexion</Text>

					<View style={styles.inputContainer}>
						<TextInput
							style={[styles.input, error && styles.inputError]}
							placeholder="Email"
							value={loginForm.email}
							onChangeText={(value) => handleInputChange("email", value)}
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>

					<View style={styles.inputContainer}>
						<TextInput
							style={[styles.input, error && styles.inputError]}
							placeholder="Mot de passe"
							value={loginForm.password}
							onChangeText={(value) => handleInputChange("password", value)}
							secureTextEntry
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>

					<TouchableOpacity
						style={[styles.button, loading && styles.buttonDisabled]}
						onPress={handleLogin}
						disabled={loading}>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.buttonText}>Se connecter</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.linkButton}
						onPress={() => navigation.navigate("Register")}>
						<Text style={styles.linkText}>
							Pas encore de compte ? S'inscrire
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.forgotPasswordButton}
						onPress={() => navigation.navigate("ForgotPassword")}>
						<Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	scrollContainer: {
		flexGrow: 1,
		justifyContent: "center",
	},
	formContainer: {
		padding: 20,
		width: "100%",
		maxWidth: 400,
		alignSelf: "center",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: colors.primary,
		marginBottom: 30,
		textAlign: "center",
	},
	inputContainer: {
		marginBottom: 15,
	},
	input: {
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "#eee",
	},
	inputError: {
		borderColor: "red",
	},
	button: {
		backgroundColor: colors.primary,
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 10,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	linkButton: {
		marginTop: 20,
		alignItems: "center",
	},
	linkText: {
		color: colors.primary,
		fontSize: 16,
	},
	forgotPasswordButton: {
		marginTop: 10,
		alignItems: "center",
	},
	forgotPasswordText: {
		color: colors.primary,
		fontSize: 14,
	},
});

export default LoginScreen;
