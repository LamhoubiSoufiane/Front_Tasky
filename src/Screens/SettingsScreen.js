import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Divider } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";
import { useDispatch } from "react-redux";
import { logout } from "../Redux/actions/authActions";

export default function SettingsScreen({ navigation }) {
	const dispatch = useDispatch();

	const handleLogout = async () => {
		await dispatch(logout());
		navigation.reset({
			index: 0,
			routes: [{ name: "Home" }],
		});
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

			<Text style={styles.header}>Settings</Text>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Profile Section */}
				<Animatable.View animation="fadeInUp" style={styles.section}>
					<Card style={styles.card}>
						<TouchableOpacity
							style={styles.option}
							onPress={() => navigation.navigate("Profile")}>
							<MaterialIcons name="account-circle" size={30} color="#333" />
							<Text style={styles.optionText}>Profile</Text>
						</TouchableOpacity>
						<Divider style={styles.divider} />
						<TouchableOpacity style={styles.option}>
							<MaterialIcons name="notifications" size={30} color="#333" />
							<Text style={styles.optionText}>Notifications</Text>
						</TouchableOpacity>
					</Card>
				</Animatable.View>

				{/* Account Section */}
				<Animatable.View animation="fadeInUp" style={styles.section}>
					<Card style={styles.card}>
						<TouchableOpacity style={styles.option}>
							<MaterialIcons name="security" size={30} color="#333" />
							<Text style={styles.optionText}>Privacy & Security</Text>
						</TouchableOpacity>
						<Divider style={styles.divider} />
						<TouchableOpacity style={styles.option}>
							<MaterialIcons name="language" size={30} color="#333" />
							<Text style={styles.optionText}>Language</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.option, styles.changePasswordButton]}
							onPress={() => navigation.navigate("ChangePassword")}>
							<MaterialIcons name="vpn-key" size={30} color="#333" />
							<Text style={[styles.optionText, { color: "#333" }]}>
								Change Password
							</Text>
						</TouchableOpacity>
					</Card>
				</Animatable.View>

				{/* Help Section */}
				<Animatable.View animation="fadeInUp" style={styles.section}>
					<Card style={styles.card}>
						<TouchableOpacity style={styles.option}>
							<MaterialIcons name="help" size={30} color="#333" />
							<Text style={styles.optionText}>Help & Support</Text>
						</TouchableOpacity>
						<Divider style={styles.divider} />
						<TouchableOpacity style={styles.option}>
							<MaterialIcons name="feedback" size={30} color="#333" />
							<Text style={styles.optionText}>Feedback</Text>
						</TouchableOpacity>
					</Card>
				</Animatable.View>

				{/* Logout Section */}
				<Animatable.View animation="fadeInUp" style={styles.section}>
					<Card style={styles.card}>
						<TouchableOpacity style={styles.option} onPress={handleLogout}>
							<MaterialIcons name="logout" size={30} color="#FF6347" />
							<Text style={[styles.optionText, { color: "#FF6347" }]}>
								Log Out
							</Text>
						</TouchableOpacity>
					</Card>
				</Animatable.View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		paddingTop: 20,
	},
	header: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
		marginBottom: 20,
	},
	section: {
		marginBottom: 20,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 10,
		elevation: 3, // Shadow effect for Android
		shadowColor: "#000", // Shadow for iOS
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 20,
	},
	optionText: {
		marginLeft: 15,
		fontSize: 18,
		color: "#333",
	},
	divider: {
		marginVertical: 5,
		backgroundColor: "#ddd",
	},
	// Style for the Change Password button
	changePasswordButton: {
		marginTop: 10, // Space between options
	},
});
