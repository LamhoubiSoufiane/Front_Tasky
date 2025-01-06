import React from "react";
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
import {
	register,
	setRegisterForm,
	resetForms,
} from "../Redux/actions/authActions";
import Toast from "react-native-toast-message";

const RegisterScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const {
		email,
		password,
		confirmPassword,
		username,
		nom,
		prenom,
		showPassword,
	} = useSelector((state) => state.auth.registerForm);
	const loading = useSelector((state) => state.auth.loading);

	const handleInputChange = (field, value) => {
		dispatch(setRegisterForm(field, value));
	};

	const validateForm = () => {
		// Validation de l'email avec une expression régulière
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email?.trim())) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Veuillez entrer une adresse email valide",
				position: "top",
				visibilityTime: 3000,
			});
			return false;
		}

		if (
			!email?.trim() ||
			!password?.trim() ||
			!confirmPassword?.trim() ||
			!username?.trim() ||
			!nom?.trim() ||
			!prenom?.trim()
		) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Veuillez remplir tous les champs",
				position: "top",
				visibilityTime: 3000,
			});
			return false;
		}

		if (password !== confirmPassword) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Les mots de passe ne correspondent pas",
				position: "top",
				visibilityTime: 3000,
			});
			return false;
		}

		if (password.length < 6) {
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

	const handleRegister = async () => {
		if (!validateForm()) return;

		try {
			const userData = {
				email: email.trim(),
				password: password.trim(),
				username: username.trim(),
				nom: nom.trim(),
				prenom: prenom.trim(),
			};

			const result = await dispatch(register(userData));

			if (result.success) {
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: result.message,
					position: "top",
					visibilityTime: 3000,
				});
				dispatch(resetForms());
				navigation.replace("Login");
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error,
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Une erreur est survenue lors de l'inscription",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	return (
		<LinearGradient
			colors={["#4c669f", "#3b5998", "#192f6a"]}
			style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}>
					<MaterialIcons name="arrow-back" size={24} color="#fff" />
				</TouchableOpacity>

				<Animatable.View animation="fadeInUpBig" style={styles.footer}>
					<Text style={styles.title}>Créer un compte</Text>

					<View style={styles.inputContainer}>
						<MaterialIcons
							name="email"
							size={20}
							color="#666"
							style={styles.icon}
						/>
						<TextInput
							placeholder="Email"
							style={styles.input}
							value={email}
							onChangeText={(value) => {
								handleInputChange("email", value);
							}}
							autoCapitalize="none"
							keyboardType="email-address"
						/>
					</View>

					<View style={styles.inputContainer}>
						<MaterialIcons
							name="person"
							size={20}
							color="#666"
							style={styles.icon}
						/>
						<TextInput
							placeholder="Nom d'utilisateur"
							style={styles.input}
							value={username}
							onChangeText={(value) => handleInputChange("username", value)}
							autoCapitalize="none"
						/>
					</View>

					<View style={styles.inputContainer}>
						<MaterialIcons
							name="person"
							size={20}
							color="#666"
							style={styles.icon}
						/>
						<TextInput
							placeholder="Nom"
							style={styles.input}
							value={nom}
							onChangeText={(value) => handleInputChange("nom", value)}
						/>
					</View>

					<View style={styles.inputContainer}>
						<MaterialIcons
							name="person"
							size={20}
							color="#666"
							style={styles.icon}
						/>
						<TextInput
							placeholder="Prénom"
							style={styles.input}
							value={prenom}
							onChangeText={(value) => handleInputChange("prenom", value)}
						/>
					</View>

					<View style={styles.inputContainer}>
						<MaterialIcons
							name="lock"
							size={20}
							color="#666"
							style={styles.icon}
						/>
						<TextInput
							placeholder="Mot de passe"
							style={styles.input}
							value={password}
							onChangeText={(value) => handleInputChange("password", value)}
							secureTextEntry={!showPassword}
						/>
						<TouchableOpacity
							onPress={() => handleInputChange("showPassword", !showPassword)}>
							<MaterialIcons
								name={showPassword ? "visibility" : "visibility-off"}
								size={20}
								color="#666"
							/>
						</TouchableOpacity>
					</View>

					<View style={styles.inputContainer}>
						<MaterialIcons
							name="lock"
							size={20}
							color="#666"
							style={styles.icon}
						/>
						<TextInput
							placeholder="Confirmer le mot de passe"
							style={styles.input}
							value={confirmPassword}
							onChangeText={(value) =>
								handleInputChange("confirmPassword", value)
							}
							secureTextEntry={!showPassword}
						/>
					</View>

					<TouchableOpacity
						style={[
							styles.registerButton,
							loading && styles.registerButtonDisabled,
						]}
						onPress={handleRegister}
						disabled={loading}>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.registerText}>S'inscrire</Text>
						)}
					</TouchableOpacity>

					<View style={styles.loginContainer}>
						<Text style={styles.loginText}>Déjà un compte ? </Text>
						<TouchableOpacity onPress={() => navigation.navigate("Login")}>
							<Text style={styles.loginLink}>Se connecter</Text>
						</TouchableOpacity>
					</View>
				</Animatable.View>
			</KeyboardAvoidingView>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backButton: {
		position: "absolute",
		top: 40,
		left: 20,
		zIndex: 1,
	},
	footer: {
		flex: 1,
		backgroundColor: "#fff",
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 20,
		paddingVertical: 30,
		marginTop: 100,
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
	registerButton: {
		backgroundColor: "#4c669f",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
	},
	registerButtonDisabled: {
		opacity: 0.7,
	},
	registerText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	loginContainer: {
		flexDirection: "row",
		marginTop: 20,
		justifyContent: "center",
	},
	loginText: {
		color: "#666",
	},
	loginLink: {
		color: "#4c669f",
		fontWeight: "bold",
	},
});

export default RegisterScreen;
