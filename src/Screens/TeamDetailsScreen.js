import React, { useMemo, useCallback, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loadTeamMembers, removeTeamMember, addTeamMember } from "../Redux/actions/teamActions";
import { loadTeamProjects } from "../Redux/actions/projectActions";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
//import { sendTeamInvitationNotification, initializeNotifications } from '../Services/notificationService';

const ProjectCard = React.memo(({ project, onPress }) => (
	<TouchableOpacity 
		style={styles.projectCard}
		onPress={() => onPress(project)}
	>
		<View style={styles.projectHeader}>
			<Text style={styles.projectTitle}>{project.nom}</Text>
			<Icon name="chevron-right" size={24} color={colors.primary} />
		</View>
		<Text style={styles.projectDescription} numberOfLines={2}>
			{project.description}
		</Text>
		<View style={styles.projectFooter}>
			<View style={styles.projectStats}>
				<Icon name="account-group" size={20} color={colors.textGray} />
				<Text style={styles.statsText}>{project.members?.length || 0} membres</Text>
			</View>
			<View style={styles.projectStats}>
				<Icon name="checkbox-marked" size={20} color={colors.textGray} />
				<Text style={styles.statsText}>{project.tasks?.length || 0} tâches</Text>
			</View>
		</View>
	</TouchableOpacity>
));

const TeamDetailsScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const dispatch = useDispatch();
	
	const { team } = route.params;
	const user = useSelector((state) => state.auth.user);
	const { loading, teamMembers } = useSelector((state) => state.team);
	const { projects, loading: projectsLoading } = useSelector((state) => state.project);
	const activeTab = route.params?.activeTab || "members";

	const currentMembers = useMemo(() => {
		if (!team?.id) return [];
		return teamMembers[team?.id] || [];
	}, [teamMembers, team?.id]);

	const currentProjects = useMemo(() => {
		if (!team?.id) return [];
		return projects[team?.id] || [];
	}, [projects, team?.id]);

	useEffect(() => {
		if (team?.id) {
			if (activeTab === "members") {
				dispatch(loadTeamMembers(team.id));
			} else {
				dispatch(loadTeamProjects(team.id));
			}
		}
	}, [team?.id, dispatch, activeTab]);

	// useEffect(() => {
	// 	// Initialize notifications when component mounts
	// 	initializeNotifications();
	// }, []);

	const isTeamOwner = useMemo(() => {
		return team?.owner?.id === user?.id;
	}, [team?.owner?.id, user?.id]);

	const handleBackPress = useCallback(() => {
		navigation?.goBack();
	}, [navigation]);

	const handleAddProject = useCallback(() => {
		navigation?.navigate("CreateProject", { teamId: team.id });
	}, [navigation, team?.id]);

	const handleAddMember = useCallback(() => {
		if (!isTeamOwner) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Seul le propriétaire peut ajouter des membres",
				position: "top",
				visibilityTime: 3000,
			});
			return;
		}
		navigation?.navigate("AddMember", { 
			teamId: team.id,
			teamName: team.nom,
			onMemberAdd: async (userId) => {
				try {
					const result = await dispatch(addTeamMember(team.id, userId));
					if (result.success) {
						Toast.show({
							type: "success",
							text1: "Succès",
							text2: "Membre ajouté avec succès",
							position: "top",
							visibilityTime: 3000,
						});
						dispatch(loadTeamMembers(team.id));
						return { success: true };
					} else {
						Toast.show({
							type: "error",
							text1: "Erreur",
							text2: result.error || "Impossible d'ajouter le membre",
							position: "top",
							visibilityTime: 3000,
						});
						return { success: false, error: result.error };
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
					return { success: false, error: error.message };
				}
			}
		});
	}, [navigation, team?.id, team?.nom, isTeamOwner, dispatch]);

	const handleProjectPress = useCallback((project) => {
		navigation?.navigate("ProjectDetails", { project });
	}, [navigation]);

	const handleMemberPress = useCallback((member) => {
		if (!isTeamOwner || member.id === user.id) return;
		
		Alert.alert(
			"Gestion du membre",
			"Que souhaitez-vous faire avec ce membre ?",
			[
				{
					text: "Voir le profil",
					onPress: () => navigation?.navigate("MemberDetails", { member }),
				},
				{
					text: "Retirer de l'équipe",
					onPress: () => handleRemoveMember(member),
					style: "destructive",
				},
				{
					text: "Annuler",
					style: "cancel",
				},
			],
		);
	}, [navigation, isTeamOwner, user?.id]);

	const handleRemoveMember = useCallback(async (member) => {
		if (!team?.id || !member?.id) return;

		Alert.alert(
			"Confirmation",
			`Êtes-vous sûr de vouloir retirer ${member.username} de l'équipe ?`,
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
							const result = await dispatch(removeTeamMember(team.id, member.id));
							if (result.success) {
								Toast.show({
									type: "success",
									text1: "Succès",
									text2: "Membre retiré avec succès",
									position: "top",
									visibilityTime: 3000,
								});
								dispatch(loadTeamMembers(team.id));
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
			],
		);
	}, [dispatch, team?.id]);

	const handleTabPress = useCallback((tab) => {
		navigation.setParams({ activeTab: tab });
	}, [navigation]);

	const renderHeader = useMemo(() => (
		<View style={styles.header}>
			<TouchableOpacity
				style={styles.backButton}
				onPress={handleBackPress}>
				<Icon name="arrow-left" size={24} color="#fff" />
			</TouchableOpacity>
			<Text style={styles.title}>{team?.nom}</Text>
			<TouchableOpacity
				style={styles.addButton}
				onPress={activeTab === "projects" ? handleAddProject : handleAddMember}>
				<Icon name="plus" size={24} color="#fff" />
			</TouchableOpacity>
		</View>
	), [handleBackPress, team?.nom, activeTab, handleAddProject, handleAddMember]);

	const renderTabs = useMemo(() => (
		<View style={styles.tabContainer}>
			<TouchableOpacity
				style={[styles.tab, activeTab === "projects" && styles.activeTab]}
				onPress={() => handleTabPress("projects")}>
				<Text style={[styles.tabText, activeTab === "projects" && styles.activeTabText]}>
					Projets
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.tab, activeTab === "members" && styles.activeTab]}
				onPress={() => handleTabPress("members")}>
				<Text style={[styles.tabText, activeTab === "members" && styles.activeTabText]}>
					Membres ({currentMembers.length})
				</Text>
			</TouchableOpacity>
		</View>
	), [activeTab, handleTabPress, currentMembers.length]);

	const renderMemberItem = useCallback(({ item: member }) => (
		<TouchableOpacity
			style={styles.itemCard}
			onPress={() => handleMemberPress(member)}>
			<View style={styles.itemInfo}>
				<Text style={styles.itemTitle}>{member.username}</Text>
				<Text style={styles.itemSubtitle}>{member.email}</Text>
				{member.id === team?.owner?.id && (
					<Text style={styles.ownerTag}>Propriétaire</Text>
				)}
			</View>
			{isTeamOwner && member.id !== user.id && (
				<Icon name="dots-vertical" size={24} color={colors.primary} />
			)}
		</TouchableOpacity>
	), [handleMemberPress, isTeamOwner, user?.id, team?.owner?.id]);

	const EmptyMembers = useMemo(() => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>
				Aucun membre dans cette équipe
			</Text>
			<Text style={styles.emptySubText}>
				Ajoutez des membres pour collaborer
			</Text>
			{isTeamOwner && (
				<TouchableOpacity
					style={[styles.addButton, styles.emptyButton]}
					onPress={handleAddMember}>
					<Text style={styles.buttonText}>Ajouter un membre</Text>
				</TouchableOpacity>
			)}
		</View>
	), [handleAddMember, isTeamOwner]);

	const renderProject = useCallback(({ item }) => (
		<ProjectCard project={item} onPress={handleProjectPress} />
	), [handleProjectPress]);

	const EmptyProjects = useMemo(() => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>
				Aucun projet dans cette équipe
			</Text>
			<Text style={styles.emptySubText}>
				Créez un projet pour commencer à collaborer
			</Text>
			{isTeamOwner && (
				<TouchableOpacity
					style={[styles.addButton, styles.emptyButton]}
					onPress={handleAddProject}>
					<Text style={styles.buttonText}>Créer un projet</Text>
				</TouchableOpacity>
			)}
		</View>
	), [handleAddProject, isTeamOwner]);

	if (loading || projectsLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{renderHeader}
			{renderTabs}
			<FlatList
				data={activeTab === "members" ? currentMembers : currentProjects}
				renderItem={activeTab === "members" ? renderMemberItem : renderProject}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
				ListEmptyComponent={activeTab === "members" ? EmptyMembers : EmptyProjects}
				refreshing={activeTab === "members" ? loading : projectsLoading}
				onRefresh={() => {
					if (activeTab === "members") {
						dispatch(loadTeamMembers(team.id));
					} else {
						dispatch(loadTeamProjects(team.id));
					}
				}}
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
	tabContainer: {
		flexDirection: "row",
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingTop: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	tab: {
		flex: 1,
		paddingVertical: 15,
		alignItems: "center",
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: colors.primary,
	},
	tabText: {
		fontSize: 16,
		color: "#666",
		fontWeight: "500",
	},
	activeTabText: {
		color: colors.primary,
		fontWeight: "600",
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
	projectCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	projectHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	projectTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	projectDescription: {
		fontSize: 14,
		color: colors.textGray,
		marginBottom: 12,
	},
	projectFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	projectStats: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statsText: {
		marginLeft: 4,
		color: colors.textGray,
		fontSize: 14,
	},
});

export default TeamDetailsScreen;
