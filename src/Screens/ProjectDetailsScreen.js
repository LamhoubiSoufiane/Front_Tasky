import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Modal,
	TextInput,
	ScrollView,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
	loadProjectMembers,
	removeProjectMember,
	addProjectMember,
} from "../Redux/actions/projectActions";
import {
	createTask,
	assignTask,
	loadProjectTasks,
} from "../Redux/actions/taskActions";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
import AddTaskButton from "../Components/AddTaskButton";
import AddTaskForm from "../Components/AddTaskForm";
import TaskItem from "../Components/TaskItem";

const CreateTaskModal = React.memo(
	({ visible, onClose, onSubmit, members = [] }) => {
		const [title, setTitle] = useState("");
		const [description, setDescription] = useState("");
		const [selectedMember, setSelectedMember] = useState(null);

		const handleSubmit = () => {
			if (!title.trim() || !description.trim()) {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: "Veuillez remplir tous les champs",
				});
				return;
			}
			onSubmit({
				titre: title,
				description,
				assignedToId: selectedMember?.id,
			});
			setTitle("");
			setDescription("");
			setSelectedMember(null);
		};

		return (
			<Modal
				visible={visible}
				animationType="slide"
				transparent={true}
				onRequestClose={onClose}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Nouvelle tâche</Text>
							<TouchableOpacity onPress={onClose}>
								<Icon name="close" size={24} color="#333" />
							</TouchableOpacity>
						</View>

						<ScrollView>
							<View style={styles.inputContainer}>
								<Text style={styles.label}>Titre</Text>
								<TextInput
									style={styles.input}
									value={title}
									onChangeText={setTitle}
									placeholder="Titre de la tâche"
								/>
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.label}>Description</Text>
								<TextInput
									style={[styles.input, styles.textArea]}
									value={description}
									onChangeText={setDescription}
									placeholder="Description de la tâche"
									multiline
									numberOfLines={4}
								/>
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.label}>Assigner à</Text>
								<View style={styles.membersList}>
									{members.map((member) => (
										<TouchableOpacity
											key={member.id}
											style={[
												styles.memberChip,
												selectedMember?.id === member.id &&
													styles.selectedMemberChip,
											]}
											onPress={() => setSelectedMember(member)}>
											<Text
												style={[
													styles.memberChipText,
													selectedMember?.id === member.id &&
														styles.selectedMemberChipText,
												]}>
												{member.name}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>

							<TouchableOpacity
								style={styles.submitButton}
								onPress={handleSubmit}>
								<Text style={styles.submitButtonText}>Créer la tâche</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</Modal>
		);
	}
);

const ProjectDetailsScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const dispatch = useDispatch();

	const { project } = route.params;
	const user = useSelector((state) => state.auth.user);
	const { projectMembers, loading } = useSelector((state) => state.project);
	const [isAddTaskVisible, setAddTaskVisible] = useState(false);

	// Correction de l'accès au state Redux avec plus de logs
	const { projectTasks, taskLoading } = useSelector((state) => {
		console.log("Current Redux State:", state);
		console.log("Task State:", state.task);
		console.log("Project Tasks:", state.task?.projectTasks);
		return {
			projectTasks: state.task?.projectTasks || [],
			taskLoading: state.task?.loading || false,
		};
	});

	useEffect(() => {
		console.log(
			"ProjectDetailsScreen - Loading tasks for project:",
			project.id
		);
		loadProjectData();
	}, [project.id]);

	useEffect(() => {
		console.log("ProjectDetailsScreen - Current projectTasks:", projectTasks);
	}, [projectTasks]);

	// Charger les membres du projet au chargement de l'écran
	useEffect(() => {
		const loadMembers = async () => {
			try {
				if (!project?.id) {
					console.error("ID du projet manquant");
					return;
				}

				// Vérifier si le projet a un teamId valide
				if (!project.teamId && !project.idTeam) {
					console.error("ID d'équipe manquant dans le projet");
					Toast.show({
						type: "error",
						text1: "Erreur",
						text2: "Impossible de charger les membres : ID d'équipe manquant",
						position: "top",
						visibilityTime: 3000,
					});
					return;
				}

				const result = await dispatch(loadProjectMembers(project.id));
				if (!result.success) {
					Toast.show({
						type: "error",
						text1: "Erreur",
						text2: result.error || "Impossible de charger les membres",
						position: "top",
						visibilityTime: 3000,
					});
				}
			} catch (error) {
				console.error("Erreur lors du chargement des membres:", error);
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: error.message || "Impossible de charger les membres",
					position: "top",
					visibilityTime: 3000,
				});
			}
		};

		loadMembers();
	}, [dispatch, project?.id]);

	const currentMembers = useMemo(() => {
		if (!project?.id) return [];
		return projectMembers[project.id] || [];
	}, [projectMembers, project?.id]);

	const isProjectOwner = useMemo(() => {
		// Le propriétaire de l'équipe est le propriétaire du projet
		return (
			project?.team?.owner?.id === user?.id ||
			project?.teamId === user?.teamOwnerId
		);
	}, [project?.team?.owner?.id, project?.teamId, user?.id, user?.teamOwnerId]);

	const handleBackPress = useCallback(() => {
		navigation?.goBack();
	}, [navigation]);

	const handleAddMember = useCallback(() => {
		if (!isProjectOwner) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Seul le propriétaire peut ajouter des membres",
				position: "top",
				visibilityTime: 3000,
			});
			return;
		}
		navigation?.navigate("AddProjectMember", {
			projectId: project.id,
			onMemberAdd: async (userId) => {
				try {
					const result = await dispatch(addProjectMember(project.id, userId));
					if (result.success) {
						Toast.show({
							type: "success",
							text1: "Succès",
							text2: "Membre ajouté avec succès",
							position: "top",
							visibilityTime: 3000,
						});
						dispatch(loadProjectMembers(project.id));
					} else {
						Toast.show({
							type: "error",
							text1: "Erreur",
							text2: result.error || "Impossible d'ajouter le membre",
							position: "top",
							visibilityTime: 3000,
						});
					}
				} catch (error) {
					console.error("Erreur lors de l'ajout du membre:", error);
					Toast.show({
						type: "error",
						text1: "Erreur",
						text2: "Impossible d'ajouter le membre",
						position: "top",
						visibilityTime: 3000,
					});
				}
			},
		});
	}, [navigation, project?.id, isProjectOwner, dispatch]);

	const handleMemberPress = useCallback(
		(member) => {
			if (!isProjectOwner || member.id === user.id) return;

			Alert.alert(
				"Gestion du membre",
				"Que souhaitez-vous faire avec ce membre ?",
				[
					{
						text: "Voir le profil",
						onPress: () => navigation?.navigate("MemberDetails", { member }),
					},
					{
						text: "Retirer du projet",
						onPress: () => handleRemoveMember(member),
						style: "destructive",
					},
					{
						text: "Annuler",
						style: "cancel",
					},
				]
			);
		},
		[navigation, isProjectOwner, user?.id]
	);

	const handleRemoveMember = useCallback(
		async (member) => {
			if (!project?.id || !member?.id) return;

			Alert.alert(
				"Confirmation",
				`Êtes-vous sûr de vouloir retirer ${member.username} du projet ?`,
				[
					{
						text: "Annuler",
						style: "cancel",
					},
					{
						text: "Confirmer",
						style: "destructive",
						onPress: async () => {
							try {
								const result = await dispatch(
									removeProjectMember(project.id, member.id)
								);
								if (result.success) {
									Toast.show({
										type: "success",
										text1: "Succès",
										text2: "Membre retiré avec succès",
										position: "top",
										visibilityTime: 3000,
									});
									dispatch(loadProjectMembers(project.id));
								} else {
									Toast.show({
										type: "error",
										text1: "Erreur",
										text2: result.error || "Impossible de retirer le membre",
										position: "top",
										visibilityTime: 3000,
									});
								}
							} catch (error) {
								console.error("Erreur lors du retrait du membre:", error);
								Toast.show({
									type: "error",
									text1: "Erreur",
									text2: "Impossible de retirer le membre",
									position: "top",
									visibilityTime: 3000,
								});
							}
						},
					},
				]
			);
		},
		[dispatch, project?.id]
	);

	const handleCreateTask = useCallback(
		async (taskData) => {
			try {
				const result = await dispatch(
					createTask({
						...taskData,
						projectId: project.id,
						status: "EN_ATTENTE",
					})
				);

				if (result.success) {
					Toast.show({
						type: "success",
						text1: "Succès",
						text2: "Tâche créée avec succès",
					});
					setAddTaskVisible(false);
				} else {
					Toast.show({
						type: "error",
						text1: "Erreur",
						text2: result.error || "Impossible de créer la tâche",
					});
				}
			} catch (error) {
				console.error("Erreur lors de la création de la tâche:", error);
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: "Une erreur est survenue",
				});
			}
		},
		[dispatch, project.id]
	);

	const handleTaskPress = useCallback(
		(task) => {
			navigation.navigate("TaskDetails", { taskId: task.id });
		},
		[navigation]
	);

	const handleAddTask = useCallback(
		async (taskData) => {
			try {
				const result = await dispatch(
					createTask({
						...taskData,
						projectId: project.id,
						status: "EN_ATTENTE",
					})
				);

				if (result.success) {
					Toast.show({
						type: "success",
						text1: "Succès",
						text2: "Tâche créée avec succès",
						position: "top",
						visibilityTime: 3000,
					});
					setAddTaskVisible(false);
					// Recharger les tâches du projet après la création
					await loadProjectData();
				} else {
					Toast.show({
						type: "error",
						text1: "Erreur",
						text2: result.error || "Impossible de créer la tâche",
						position: "top",
						visibilityTime: 3000,
					});
				}
			} catch (error) {
				console.error("Erreur lors de la création de la tâche:", error);
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: "Une erreur est survenue lors de la création de la tâche",
					position: "top",
					visibilityTime: 3000,
				});
			}
		},
		[dispatch, project.id, loadProjectData]
	);

	const handleViewMembers = useCallback(() => {
		navigation.navigate("ProjectMembers", { project, members: currentMembers });
	}, [navigation, project, currentMembers]);

	const renderHeader = useMemo(
		() => (
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
					<Icon name="arrow-left" size={24} color="#fff" />
				</TouchableOpacity>
				<Text style={styles.title}>{project?.nom}</Text>
				{isProjectOwner && (
					<TouchableOpacity
						style={styles.addButton}
						onPress={() => setAddTaskVisible(true)}>
						<Icon name="plus" size={24} color="#fff" />
					</TouchableOpacity>
				)}
			</View>
		),
		[handleBackPress, project?.nom, isProjectOwner]
	);

	const renderMemberItem = useCallback(
		({ item: member }) => (
			<TouchableOpacity
				style={styles.itemCard}
				onPress={() => handleMemberPress(member)}>
				<View style={styles.itemInfo}>
					<Text style={styles.itemTitle}>{member.username}</Text>
					<Text style={styles.itemSubtitle}>{member.email}</Text>
					{member.id === project?.owner?.id && (
						<Text style={styles.ownerTag}>Propriétaire</Text>
					)}
				</View>
				{isProjectOwner && member.id !== user.id && (
					<Icon name="dots-vertical" size={24} color={colors.primary} />
				)}
			</TouchableOpacity>
		),
		[handleMemberPress, isProjectOwner, user?.id, project?.owner?.id]
	);

	const EmptyMembers = useMemo(
		() => (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>Aucun membre dans ce projet</Text>
				<Text style={styles.emptySubText}>
					Ajoutez des membres pour collaborer
				</Text>
				{isProjectOwner && (
					<TouchableOpacity
						style={[styles.addButton, styles.emptyButton]}
						onPress={handleAddMember}>
						<Text style={styles.buttonText}>Ajouter un membre</Text>
					</TouchableOpacity>
				)}
			</View>
		),
		[handleAddMember, isProjectOwner]
	);

	const renderTask = useCallback(
		({ item }) => {
			console.log("Rendering task item:", item);
			if (!item) {
				console.log("Item is null or undefined");
				return null;
			}
			return (
				<TaskItem
					task={{
						id: item.id,
						title: item.nom,
						project: project.nom,
						time: new Date(item.endDate).toLocaleDateString(),
						status: item.statut?.toLowerCase() || "en_attente",
						description: item.description,
						assignedTo: item.member?.name || "Non assigné",
					}}
					onPress={() => handleTaskPress(item)}
				/>
			);
		},
		[project.nom, handleTaskPress]
	);

	const loadProjectData = async () => {
		try {
			console.log("Chargement des données du projet...");
			const result = await dispatch(loadProjectTasks(project.id));
			console.log("Résultat du chargement:", result);
			if (!result.success) {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error || "Impossible de charger les tâches",
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Erreur lors du chargement des tâches:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Impossible de charger les tâches",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{renderHeader}
			<FlatList
				ListHeaderComponent={
					<>
						<View style={styles.descriptionContainer}>
							<Text style={styles.descriptionTitle}>Description</Text>
							<Text style={styles.descriptionText}>
								{project?.description || "Aucune description"}
							</Text>
						</View>
						<TouchableOpacity
							style={styles.membersLink}
							onPress={handleViewMembers}>
							<View style={styles.membersLinkContent}>
								<Text style={styles.membersLinkText}>
									Voir les membres du projet
								</Text>
								<Icon name="chevron-right" size={24} color={colors.primary} />
							</View>
						</TouchableOpacity>
						<View style={styles.tasksHeader}>
							<Text style={styles.tasksTitle}>Tâches du projet</Text>
							{isProjectOwner && (
								<TouchableOpacity
									style={styles.addTaskButton}
									onPress={() => setAddTaskVisible(true)}>
									<Icon name="plus" size={24} color={colors.primary} />
									<Text style={styles.addTaskText}>Ajouter une tâche</Text>
								</TouchableOpacity>
							)}
						</View>
					</>
				}
				data={projectTasks}
				renderItem={renderTask}
				keyExtractor={(item) => item.id?.toString()}
				contentContainerStyle={styles.tasksList}
				refreshing={taskLoading}
				onRefresh={loadProjectData}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Icon
							name="clipboard-text-outline"
							size={50}
							color={colors.textGray}
						/>
						<Text style={styles.emptyText}>Aucune tâche pour le moment</Text>
					</View>
				}
			/>
			<AddTaskForm
				visible={isAddTaskVisible}
				onClose={() => setAddTaskVisible(false)}
				onSubmit={handleAddTask}
				members={currentMembers}
			/>
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
	addButton: {
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
	descriptionContainer: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	descriptionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 10,
	},
	descriptionText: {
		fontSize: 16,
		color: "#666",
		lineHeight: 24,
	},
	membersContainer: {
		flex: 1,
	},
	membersTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		padding: 20,
		paddingBottom: 10,
	},
	listContainer: {
		padding: 15,
		flexGrow: 1,
	},
	itemCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	itemInfo: {
		flex: 1,
	},
	itemTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 5,
	},
	itemSubtitle: {
		fontSize: 14,
		color: "#666",
		marginBottom: 10,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 50,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 10,
	},
	emptySubText: {
		fontSize: 14,
		color: "#666",
		marginBottom: 20,
	},
	emptyButton: {
		width: "auto",
		height: "auto",
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: colors.primary,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	ownerTag: {
		fontSize: 12,
		color: colors.primary,
		fontWeight: "500",
		marginTop: 5,
	},
	tasksContainer: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		padding: 16,
	},
	tasksHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#f5f5f5",
	},
	tasksTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	addTaskButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.backgroundLight,
		padding: 10,
		borderRadius: 8,
	},
	addTaskText: {
		marginLeft: 8,
		color: colors.primary,
		fontWeight: "600",
	},
	tasksList: {
		paddingHorizontal: 16,
		paddingBottom: 16,
		backgroundColor: "#f5f5f5",
	},
	tasksContent: {
		flex: 1,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		maxHeight: "80%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
	},
	inputContainer: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	input: {
		backgroundColor: "#f5f5f5",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
	textArea: {
		height: 120,
		textAlignVertical: "top",
	},
	membersList: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 8,
	},
	memberChip: {
		backgroundColor: "#f5f5f5",
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 6,
		marginRight: 8,
		marginBottom: 8,
	},
	selectedMemberChip: {
		backgroundColor: colors.primary,
	},
	memberChipText: {
		color: "#333",
		fontSize: 14,
	},
	selectedMemberChipText: {
		color: "#fff",
	},
	submitButton: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		padding: 16,
		alignItems: "center",
		marginTop: 20,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	membersLink: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	membersLinkContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	membersLinkText: {
		fontSize: 16,
		color: colors.primary,
		fontWeight: "600",
	},
});

export default ProjectDetailsScreen;
