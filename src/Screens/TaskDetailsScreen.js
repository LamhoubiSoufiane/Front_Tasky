import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	Modal,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../assets/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { loadProjectMembers } from "../Redux/actions/projectActions";
import {
	assignTaskToMember,
	loadProjectTasks,
} from "../Redux/actions/taskActions";
import Toast from "react-native-toast-message";

const TaskDetailsScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const dispatch = useDispatch();
	const { taskId } = route.params;
	const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);

	const task = useSelector((state) =>
		state.task.projectTasks.find((t) => t.id === taskId)
	);

	const projectMembers = useSelector((state) => {
		console.log("in Task details screen Task:", task);
		return task?.projetId
			? state.project.projectMembers[task.projetId] || []
			: [];
	});

	// Trouver le membre assigné à partir de son ID
	const assignedMember = projectMembers.find(
		(member) => member.id === task?.memberId
	);
	console.log("Membre assigné:", assignedMember);

	useEffect(() => {
		const loadMembers = async () => {
			if (task?.projetId) {
				console.log("Chargement des membres pour le projet:", task.projetId);
				try {
					const result = await dispatch(loadProjectMembers(task.projetId));
					console.log("Résultat du chargement des membres:", result);
					if (!result.success) {
						Toast.show({
							type: "error",
							text1: "Erreur",
							text2: "Impossible de charger les membres du projet",
							position: "top",
							visibilityTime: 3000,
						});
					}
				} catch (error) {
					console.error("Erreur lors du chargement des membres:", error);
					Toast.show({
						type: "error",
						text1: "Erreur",
						text2: "Erreur lors du chargement des membres",
						position: "top",
						visibilityTime: 3000,
					});
				}
			} else {
				console.log("Pas d'ID de projet trouvé dans la tâche");
			}
		};
		loadMembers();
	}, [dispatch, task?.projetId]);

	const reloadTaskData = async () => {
		if (task?.projetId) {
			await dispatch(loadProjectTasks(task.projetId));
		}
	};

	if (!task) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	const handleBackPress = () => {
		navigation.goBack();
	};

	const handleAssignTask = async (memberId) => {
		try {
			const result = await dispatch(assignTaskToMember(taskId, memberId));
			if (result.success) {
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: "Tâche assignée avec succès",
					position: "top",
					visibilityTime: 3000,
				});
				setIsAssignModalVisible(false);
				await reloadTaskData();
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error || "Impossible d'assigner la tâche",
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Erreur lors de l'assignation:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Impossible d'assigner la tâche",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "terminé":
				return "#4CAF50";
			case "en_cours":
				return "#2196F3";
			case "en_attente":
			default:
				return "#FFC107";
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
					<Icon name="arrow-left" size={24} color="#fff" />
				</TouchableOpacity>
				<Text style={styles.title}>Détails de la tâche</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView style={styles.content}>
				<View style={styles.section}>
					<Text style={styles.taskTitle}>{task.nom}</Text>
					<View
						style={[
							styles.statusBadge,
							{ backgroundColor: getStatusColor(task.statut) },
						]}>
						<Text style={styles.statusText}>{task.statut || "En attente"}</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Description</Text>
					<Text style={styles.description}>
						{task.description || "Aucune description"}
					</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Date d'échéance</Text>
					<Text style={styles.dateText}>
						{new Date(task.endDate).toLocaleDateString()}
					</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Assigné à</Text>
					<View style={styles.assigneeContainer}>
						<Text style={styles.assigneeText}>
							{assignedMember
								? assignedMember.username || assignedMember.name
								: "Non assigné"}
						</Text>
						<TouchableOpacity
							style={styles.assignButton}
							onPress={() => setIsAssignModalVisible(true)}>
							<Icon name="account-plus" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>
				</View>

				<Modal
					visible={isAssignModalVisible}
					animationType="slide"
					transparent={true}
					onRequestClose={() => setIsAssignModalVisible(false)}>
					<View style={styles.modalContainer}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>Assigner la tâche à</Text>
							<ScrollView>
								{projectMembers.length > 0 ? (
									projectMembers.map((member) => (
										<TouchableOpacity
											key={member.id}
											style={styles.memberItem}
											onPress={() => handleAssignTask(member.id)}>
											<Text style={styles.memberName}>
												{member.name || member.username}
											</Text>
										</TouchableOpacity>
									))
								) : (
									<Text style={styles.noMembersText}>
										Aucun membre disponible
									</Text>
								)}
							</ScrollView>
							<TouchableOpacity
								style={styles.closeButton}
								onPress={() => setIsAssignModalVisible(false)}>
								<Text style={styles.closeButtonText}>Fermer</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		paddingTop: 60,
		backgroundColor: colors.primary,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
		flex: 1,
		textAlign: "center",
		marginHorizontal: 10,
	},
	placeholder: {
		width: 40,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	section: {
		marginBottom: 24,
	},
	taskTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	statusBadge: {
		alignSelf: "flex-start",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		marginTop: 8,
	},
	statusText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	description: {
		fontSize: 16,
		color: "#666",
		lineHeight: 24,
	},
	dateText: {
		fontSize: 16,
		color: "#666",
	},
	assigneeText: {
		fontSize: 16,
		color: "#666",
	},
	assigneeContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	assignButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: "#f0f0f0",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		width: "80%",
		maxHeight: "70%",
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	memberItem: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	memberName: {
		fontSize: 16,
		color: "#333",
	},
	closeButton: {
		marginTop: 20,
		padding: 15,
		backgroundColor: colors.primary,
		borderRadius: 8,
		alignItems: "center",
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	noMembersText: {
		textAlign: "center",
		color: "#666",
		fontSize: 16,
		marginVertical: 20,
	},
});

export default TaskDetailsScreen;
