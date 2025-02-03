import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { colors } from "../assets/colors";

const AddTaskButton = ({ project, onPress }) => {
	const user = useSelector((state) => state.auth.user);
	const teams = useSelector((state) => state.team.teams);

	// Trouver l'équipe associée au projet
	const team = teams.find((t) => t.id === project.teamId);

	// Vérifier si l'utilisateur connecté est le propriétaire de l'équipe
	const isTeamOwner = team?.owner?.id === user?.id;

	if (!isTeamOwner) {
		return null;
	}

	return (
		<TouchableOpacity style={styles.button} onPress={onPress}>
			<Text style={styles.buttonText}>Ajouter une tâche</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: colors.primary,
		padding: 12,
		borderRadius: 8,
		marginVertical: 10,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default AddTaskButton;
