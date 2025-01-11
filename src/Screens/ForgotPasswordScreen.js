import React from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	SafeAreaView,
	StatusBar,
} from "react-native";

export default function ForgotPasswordScreen({ navigation }) {
	const [email, setEmail] = useState("");

	const handleForgotPassword = () => {
		if (!email) {
			Alert.alert("Error", "Please enter your email address.");
			return;
		}

		// Add your password reset logic here, such as an API call to send the email.

		Alert.alert(
			"Success",
			"A password reset link has been sent to your email."
		);
		navigation.goBack(); // Navigate back to the previous screen after successful reset request
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

			<Text style={styles.header}>Forgot Password</Text>

			<Text style={styles.subHeader}>
				Enter your email address below to receive a password reset link.
			</Text>

			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Email Address"
					keyboardType="email-address"
					value={email}
					onChangeText={setEmail}
				/>
			</View>

			<TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
				<Text style={styles.buttonText}>Send Reset Link</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.backButton}
				onPress={() => navigation.goBack()}>
				<Text style={styles.backButtonText}>Back to Login</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		paddingHorizontal: 20,
		paddingTop: 30,
	},
	header: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
		marginBottom: 20,
	},
	subHeader: {
		fontSize: 16,
		color: "#777",
		textAlign: "center",
		marginBottom: 20,
	},
	inputContainer: {
		marginBottom: 20,
	},
	input: {
		height: 50,
		borderColor: "#ddd",
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 15,
		backgroundColor: "#fff",
	},
	button: {
		backgroundColor: "#4f86c6",
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	backButton: {
		marginTop: 20,
		alignItems: "center",
	},
	backButtonText: {
		color: "#4f86c6",
		fontSize: 16,
	},
});
