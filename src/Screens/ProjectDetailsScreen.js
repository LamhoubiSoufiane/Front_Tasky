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
	fetchProjectTasks,
	clearProjectTasks,
} from "../Redux/actions/taskActions";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
import AddTaskButton from "../Components/AddTaskButton";
import AddTaskForm from "../Components/AddTaskForm";
import TaskItem from "../Components/TaskItem";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { API_WS_URL, API_BASE_URL } from '../config';
import { io } from 'socket.io-client';

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
			
			
			onSubmit(
				{
					titre: title,
					description,
					assignedToId: selectedMember?.id,
				}
				);
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
	const { projectTasks, taskLoading } = useSelector((state) => ({
		projectTasks: state.task.projectTasks,
		taskLoading: state.task.loading
	}));
	const [isAddTaskVisible, setAddTaskVisible] = useState(false);
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		console.log("Loading tasks for project:", project.id);
		loadProjectData();

		// Cleanup function
		return () => {
			console.log("Cleaning up project tasks");
			dispatch(clearProjectTasks());
		};
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

	useEffect(() => {
		let socket = null;
		let isComponentMounted = true;

		const connectSocket = () => {
			console.log('Connexion socket.io:', API_WS_URL);
			
			socket = io(API_BASE_URL, {
				path: '/websockets',
				transports: ['websocket'],
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 3000,
			});

			socket.on('connect', () => {
				console.log('Socket.io connecté avec succès');
				// Envoyer l'ID du projet pour s'abonner aux mises à jour
				socket.emit('joinProject', { projectId: project.id });
			});

			socket.on('joinedProject', (response) => {
				console.log('Confirmation joinProject reçue:', response);
			});

			socket.on('taskCreated', (message) => {
				console.log('Nouvelle tâche reçue:', message);
				dispatch(loadProjectTasks(project.id));
			});

			socket.on('taskUpdated', (message) => {
				console.log('Mise à jour tâche reçue:', message);
				dispatch(loadProjectTasks(project.id));
			});

			socket.on('taskStatusUpdated', (message) => {
				console.log('Mise à jour du statut reçue:', message);
				dispatch(loadProjectTasks(project.id));
			});

			socket.on('taskAssigned', (message) => {
				console.log('Assignation de tâche reçue:', message);
				dispatch(loadProjectTasks(project.id));
			});

			socket.on('taskDeleted', (message) => {
				console.log('Suppression tâche reçue:', message);
				dispatch(loadProjectTasks(project.id));
			});

			socket.on('connect_error', (error) => {
				console.error('Erreur de connexion socket.io:', error);
			});

			socket.on('disconnect', (reason) => {
				console.log('Socket.io déconnecté, raison:', reason);
			});

			return socket;
		};

		// Première connexion
		socket = connectSocket();

		// Nettoyage à la déconnexion
		return () => {
			isComponentMounted = false;
			if (socket) {
				console.log('Fermeture propre du socket');
				socket.disconnect();
			}
		};
	}, [project.id, dispatch]);

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
			if (!item) {
				return null;
			}
			// Get the members array for this project
			const members = projectMembers[project.id] || [];
			// Find the assigned member
			const assignedMember = members.find(m => m.id === item.memberId);
			
			return (
				<TaskItem
					task={{
						id: item.id,
						title: item.nom,
						project: project.nom,
						time: new Date(item.endDate).toLocaleDateString(),
						status: item.statut?.toLowerCase() || "en_attente",
						assignedTo: assignedMember ? (assignedMember.username || assignedMember.name) : "Non assigné",
						memberId: item.memberId
					}}
					projectMembers={members}
				/>
			);
		},
		[project.nom, projectMembers]
	);

	const loadProjectData = async () => {
		try {
			console.log("Chargement des données du projet...");
			const result = await dispatch(fetchProjectTasks(project.id));
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
									<Icon name="plus" size={24} color="#fff" />
									<Text style={styles.addTaskText}>Ajouter une tâche</Text>
								</TouchableOpacity>
							)}
						</View>
					</>
				}
				data={projectTasks}
				renderItem={renderTask}
				keyExtractor={(item) => `project-task-${item.id}`}
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
		backgroundColor: "#eef2f3",
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
		backgroundColor: "#4c669f",
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	backButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	addButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	title: {
		fontSize: 32,
		fontWeight: "900",
		color: "#fff",
		flex: 1,
		textAlign: "center",
		marginHorizontal: 15,
		letterSpacing: 0.5,
	},
	descriptionContainer: {
		margin: 20,
		padding: 20,
		backgroundColor: "#fff",
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 3,
	},
	descriptionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#333",
		marginBottom: 12,
		letterSpacing: 0.5,
	},
	descriptionText: {
		fontSize: 16,
		color: "#666",
		lineHeight: 24,
		letterSpacing: 0.3,
	},
	membersLink: {
		margin: 20,
		marginTop: 0,
		padding: 16,
		backgroundColor: "#fff",
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 3,
	},
	membersLinkContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	membersLinkText: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.primary,
		letterSpacing: 0.3,
	},
	tasksHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		marginTop: 10,
		marginBottom: 15,
		flexWrap: "wrap",
		gap: 10,
	},
	tasksTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#333",
		letterSpacing: 0.5,
	},
	addTaskButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#4c669f",
		padding: 12,
		borderRadius: 25,
		paddingHorizontal: 20,
	},
	addTaskText: {
		color: "#fff",
		marginLeft: 8,
		fontSize: 16,
		fontWeight: "600",
	},
	tasksList: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	emptyContainer: {
		padding: 30,
		alignItems: "center",
		backgroundColor: "#fff",
		margin: 20,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 3,
	},
	emptyText: {
		fontSize: 20,
		fontWeight: "600",
		color: "#333",
		marginTop: 15,
		textAlign: "center",
		letterSpacing: 0.3,
	},
});

export default ProjectDetailsScreen;
