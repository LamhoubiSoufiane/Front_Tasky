import React, { useMemo, useCallback, useEffect, useState } from "react";
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
import {
	loadTeamMembers,
	removeTeamMember,
	addTeamMember,
} from "../Redux/actions/teamActions";
import { loadTeamProjects } from "../Redux/actions/projectActions";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";

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
	const { projects, loading: projectsLoading } = useSelector(
		(state) => state.project
	);

	const currentMembers = useMemo(() => {
		if (!team?.id) return [];
		return teamMembers[team?.id] || [];
	}, [teamMembers, team?.id]);

	const currentProjects = useMemo(() => {
		if (!team?.id) return [];
		return projects[team?.id] || [];
	}, [projects, team?.id]);

	const [activeTab, setActiveTab] = useState("members");

	useEffect(() => {
		if (team?.id) {
			dispatch(loadTeamMembers(team.id));
			dispatch(loadTeamProjects(team.id));
		}
	}, [team?.id, dispatch]);

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
			},
		});
	}, [navigation, team?.id, team?.nom, isTeamOwner, dispatch]);

	const handleProjectPress = useCallback(
		(project) => {
			navigation?.navigate("ProjectDetails", { project });
		},
		[navigation]
	);

	const handleMemberPress = useCallback(
		(member) => {
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
				]
			);
		},
		[navigation, isTeamOwner, user?.id]
	);

	const handleRemoveMember = useCallback(
		async (member) => {
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
								const result = await dispatch(
									removeTeamMember(team.id, member.id)
								);
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
				]
			);
		},
		[dispatch, team?.id]
	);

	const handleTabChange = useCallback((tab) => {
		setActiveTab(tab);
	}, []);

	const renderHeader = useMemo(
		() => (
			<View style={styles.header}>
				<View style={styles.headerBackground} />
				<View style={styles.headerGradient} />
				<TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
					<Icon name="arrow-left" size={24} color="#fff" />
				</TouchableOpacity>
				<Text style={styles.title}>{team?.nom}</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={
						activeTab === "projects" ? handleAddProject : handleAddMember
					}>
					<Icon name="plus" size={24} color="#fff" />
				</TouchableOpacity>
			</View>
		),
		[handleBackPress, team?.nom, activeTab, handleAddProject, handleAddMember]
	);

	const renderTabs = useMemo(() => (
		<View style={styles.tabContainer}>
			<TouchableOpacity
				style={[styles.tab, activeTab === "members" && styles.activeTab]}
				onPress={() => handleTabChange("members")}
			>
				<Text
					style={[styles.tabText, activeTab === "members" && styles.activeTabText]}
				>
					Membres ({currentMembers.length})
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.tab, activeTab === "projects" && styles.activeTab]}
				onPress={() => handleTabChange("projects")}
			>
				<Text
					style={[styles.tabText, activeTab === "projects" && styles.activeTabText]}
				>
					Projets
				</Text>
			</TouchableOpacity>
		</View>
	), [activeTab, handleTabChange, currentMembers.length]);

	const renderMemberItem = useCallback(
		({ item: member }) => (
			<TouchableOpacity
				style={styles.itemCard}
				onPress={() => handleMemberPress(member)}
			>
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
		),
		[handleMemberPress, isTeamOwner, user?.id, team?.owner?.id]
	);

	const renderProjectItem = useCallback(
		({ item: project }) => (
			<TouchableOpacity
				style={styles.itemCard}
				onPress={() => handleProjectPress(project)}
			>
				<View style={styles.itemInfo}>
					<Text style={styles.itemTitle}>{project.nom}</Text>
					<Text style={styles.itemSubtitle}>
						{project.description || "Aucune description"}
					</Text>
					{project.owner?.id === user?.id && (
						<Text style={styles.ownerTag}>Propriétaire</Text>
					)}
				</View>
				<Icon name="chevron-right" size={24} color={colors.primary} />
			</TouchableOpacity>
		),
		[handleProjectPress, user?.id]
	);

	const EmptyMembers = useMemo(
		() => (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>Aucun membre dans cette équipe</Text>
				<Text style={styles.emptySubText}>
					Ajoutez des membres pour collaborer
				</Text>
				{isTeamOwner && (
					<TouchableOpacity
						style={[styles.addButton, styles.emptyButton]}
						onPress={handleAddMember}
					>
						<Text style={styles.buttonText}>Ajouter un membre</Text>
					</TouchableOpacity>
				)}
			</View>
		),
		[handleAddMember, isTeamOwner]
	);

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
					onPress={handleAddProject}
				>
					<Text style={styles.buttonText}>Créer un projet</Text>
				</TouchableOpacity>
			)}
		</View>
	), [handleAddProject, isTeamOwner]);

	const renderContent = useMemo(() => {
		if (activeTab === "members") {
			return (
				<FlatList
					data={currentMembers}
					renderItem={renderMemberItem}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContainer}
					ListEmptyComponent={EmptyMembers}
					refreshing={loading}
					onRefresh={() => dispatch(loadTeamMembers(team.id))}
				/>
			);
		} else {
			return (
				<FlatList
					data={currentProjects}
					renderItem={renderProjectItem}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContainer}
					ListEmptyComponent={EmptyProjects}
					refreshing={projectsLoading}
					onRefresh={() => dispatch(loadTeamProjects(team.id))}
				/>
			);
		}
	}, [activeTab, currentMembers, currentProjects, isTeamOwner, handleRemoveMember, handleProjectPress]);

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
			{renderContent}
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
		backgroundColor: "#eef2f3",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 35,
		paddingHorizontal: 25,
		backgroundColor: "#4c669f",
		borderBottomLeftRadius: 35,
		borderBottomRightRadius: 35,
		elevation: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
		marginBottom: 15,
		position: 'relative',
		overflow: 'hidden',
	},
	headerBackground: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#4c669f',
		opacity: 0.9,
		zIndex: 1,
	},
	headerGradient: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		transform: [{ skewY: '-5deg' }],
		zIndex: 1,
	},
	backButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1.5,
		borderColor: "rgba(255, 255, 255, 0.4)",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 5,
		position: 'relative',
		zIndex: 2,
	},
	addButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1.5,
		borderColor: "rgba(255, 255, 255, 0.4)",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 5,
		position: 'relative',
		zIndex: 2,
	},
	title: {
		fontSize: 32,
		fontWeight: "900",
		color: "#fff",
		flex: 1,
		textAlign: "center",
		marginHorizontal: 15,
		letterSpacing: 1,
		textShadowColor: 'rgba(0, 0, 0, 0.25)',
		textShadowOffset: { width: 0, height: 3 },
		textShadowRadius: 4,
		position: 'relative',
		zIndex: 2,
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e7ff",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		marginHorizontal: 8,
		borderRadius: 12,
	},
	activeTab: {
		backgroundColor: "#4c669f",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 3,
	},
	tabText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#7f8c8d",
		letterSpacing: 0.3,
	},
	activeTabText: {
		color: "#fff",
		fontWeight: "800",
	},
	listContainer: {
		padding: 20,
		flexGrow: 1,
	},
	itemCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 16,
		marginBottom: 15,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.15,
		shadowRadius: 5,
		elevation: 6,
	},
	itemInfo: {
		flex: 1,
	},
	itemTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: "#2c3e50",
		marginBottom: 6,
		letterSpacing: 0.3,
	},
	itemSubtitle: {
		fontSize: 15,
		color: "#7f8c8d",
		marginBottom: 8,
		letterSpacing: 0.2,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 50,
		paddingHorizontal: 25,
	},
	emptyText: {
		fontSize: 22,
		fontWeight: "800",
		color: "#34495e",
		marginBottom: 12,
		textAlign: "center",
		letterSpacing: 0.3,
	},
	emptySubText: {
		fontSize: 17,
		color: "#7f8c8d",
		marginBottom: 25,
		textAlign: "center",
		lineHeight: 24,
		letterSpacing: 0.2,
	},
	emptyButton: {
		width: "auto",
		height: "auto",
		paddingVertical: 15,
		paddingHorizontal: 25,
		backgroundColor: "#4c669f",
		borderRadius: 15,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 5,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	ownerTag: {
		fontSize: 13,
		color: "#4c669f",
		fontWeight: "700",
		marginTop: 5,
		letterSpacing: 0.2,
		backgroundColor: "#e0e7ff",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		alignSelf: "flex-start",
	},
	projectCard: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 20,
		marginBottom: 15,
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.15,
		shadowRadius: 5,
	},
	projectHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	projectTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: '#2c3e50',
		letterSpacing: 0.3,
	},
	projectDescription: {
		fontSize: 15,
		color: '#7f8c8d',
		marginBottom: 15,
		letterSpacing: 0.2,
		lineHeight: 22,
	},
	projectFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderTopWidth: 1,
		borderTopColor: '#e0e7ff',
		paddingTop: 15,
	},
	projectStats: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statsText: {
		marginLeft: 8,
		color: '#7f8c8d',
		fontSize: 15,
		fontWeight: '600',
		letterSpacing: 0.2,
	},
});

export default TeamDetailsScreen;
