import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { colors } from "../assets/colors";

const TeamProjectsTab = ({ projects = [] }) => {
	return (
		<View style={styles.container}>
			{projects.length === 0 ? (
				<Text style={styles.text}>
					Section des projets en cours de développement
				</Text>
			) : (
				<FlatList
					data={projects}
					keyExtractor={(item) => `team-project-${item.id}`}
					renderItem={({ item }) => (
						<View style={styles.projectItem}>
							<Text style={styles.projectName}>{item.nom}</Text>
						</View>
					)}
				/>
			)}
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
	projectItem: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.lightGray,
		width: "100%",
	},
	projectName: {
		fontSize: 16,
		color: colors.primary,
	}
});

export default TeamProjectsTab;
