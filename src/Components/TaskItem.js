import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../assets/colors";

const TaskItem = memo(({ task, onPress }) => {
	const getStatusStyle = (status) => {
		switch (status) {
			case "termine":
				return styles.statusDone;
			case "en_cours":
				return styles.statusInProgress;
			case "a_faire":
				return styles.statusTodo;
			default:
				return styles.statusTodo;
		}
	};

	const getStatusText = (status) => {
		switch (status) {
			case "termine":
				return "TERMINÉ";
			case "en_cours":
				return "EN COURS";
			case "a_faire":
				return "À FAIRE";
			default:
				return status.toUpperCase();
		}
	};

	return (
		<TouchableOpacity style={styles.container} onPress={onPress}>
			<View style={styles.timeContainer}>
				<Text style={styles.time}>{task.time}</Text>
			</View>
			<View style={styles.contentContainer}>
				<Text style={styles.title}>{task.title}</Text>
				<Text style={styles.project}>{task.project}</Text>
			</View>
			<View style={[styles.status, getStatusStyle(task.status)]}>
				<Text style={styles.statusText}>{getStatusText(task.status)}</Text>
			</View>
		</TouchableOpacity>
	);
});

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 16,
		marginHorizontal: 16,
		marginVertical: 8,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 3,
	},
	timeContainer: {
		marginRight: 16,
	},
	time: {
		fontSize: 12,
		color: "#666",
	},
	contentContainer: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333",
		marginBottom: 4,
	},
	project: {
		fontSize: 12,
		color: "#666",
	},
	status: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 16,
	},
	statusText: {
		fontSize: 10,
		fontWeight: "500",
	},
	statusDone: {
		backgroundColor: "#E8F5E9",
	},
	statusInProgress: {
		backgroundColor: "#E3F2FD",
	},
	statusTodo: {
		backgroundColor: "#FFF3E0",
	},
});

export default TaskItem;
