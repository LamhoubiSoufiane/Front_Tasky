import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../assets/colors";

const MessagesScreen = () => {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>
				Page des messages en cours de développement
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 20,
	},
	text: {
		fontSize: 18,
		color: colors.primary,
		textAlign: "center",
	},
});

export default MessagesScreen;
