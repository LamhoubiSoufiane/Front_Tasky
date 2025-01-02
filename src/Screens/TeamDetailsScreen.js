import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loadTeamMembers } from "../Redux/actions/teamActions";
import { colors } from "../assets/colors";
import TeamMembersTab from "../Components/TeamMembersTab";
import TeamProjectsTab from "../Components/TeamProjectsTab";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const TeamDetailsScreen = ({ route, navigation }) => {
	const { team } = route.params;
	const dispatch = useDispatch();
	const [activeTab, setActiveTab] = useState("members");
	const { loading, error, teamMembers } = useSelector((state) => state.team);
	const { user: currentUser } = useSelector((state) => state.auth);

	useEffect(() => {
		loadTeamData();
	}, []);

	const loadTeamData = async () => {
		try {
			await dispatch(loadTeamMembers(team.id));
		} catch (error) {
			console.error(
				"Erreur lors du chargement des données de l'équipe:",
				error
			);
		}
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "members":
				return (
					<TeamMembersTab team={team} members={teamMembers[team.id] || []} />
				);
			case "projects":
				return <TeamProjectsTab team={team} />;
			default:
				return null;
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
			<TouchableOpacity
				style={styles.backButton}
				onPress={() => navigation.navigate("TeamsList")}>
				<Icon name="arrow-left" size={30} color="#fff" />
			</TouchableOpacity>

			<View style={styles.header}>
				<Text style={styles.teamName}>{team.nom}</Text>
				<Text style={styles.ownerInfo}>Créée par {team.owner.username}</Text>
			</View>

			<View style={styles.tabs}>
				<TouchableOpacity
					style={[styles.tab, activeTab === "members" && styles.activeTab]}
					onPress={() => setActiveTab("members")}>
					<Text
						style={[
							styles.tabText,
							activeTab === "members" && styles.activeTabText,
						]}>
						Membres ({teamMembers[team.id]?.length || 0})
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === "projects" && styles.activeTab]}
					onPress={() => setActiveTab("projects")}>
					<Text
						style={[
							styles.tabText,
							activeTab === "projects" && styles.activeTabText,
						]}>
						Projets
					</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.content}>{renderTabContent()}</View>

			{currentUser.id === team.owner.id && (
				<TouchableOpacity
					style={styles.floatingButton}
					onPress={() => navigation.navigate("AddMember", { team })}>
					<Icon name="plus" size={30} color="#fff" />
				</TouchableOpacity>
			)}
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
	backButton: {
		position: "absolute",
		top: 20,
		left: 20,
		zIndex: 1,
		padding: 10,
	},
	header: {
		padding: 20,
		paddingTop: 60,
		backgroundColor: colors.primary,
	},
	teamName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 5,
	},
	ownerInfo: {
		fontSize: 14,
		color: "#fff",
		opacity: 0.8,
	},
	tabs: {
		flexDirection: "row",
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
	},
	activeTabText: {
		color: colors.primary,
		fontWeight: "600",
	},
	content: {
		flex: 1,
	},
	floatingButton: {
		position: "absolute",
		bottom: 20,
		alignSelf: "center",
		backgroundColor: colors.primary,
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
});

export default TeamDetailsScreen;
