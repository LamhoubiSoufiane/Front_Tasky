import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loadUserTeams, loadTeamMembers } from "../Redux/actions/teamActions";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

const TeamScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.auth);
	const { loading, error, teams, teamMembers } = useSelector(
		(state) => state.team
	);
	const [loadingMembers, setLoadingMembers] = useState(false);

	useEffect(() => {
		loadTeams();
	}, []);

	useEffect(() => {
		if (teams && teams.length > 0) {
			loadAllTeamMembers();
		}
	}, [teams]);

	const loadAllTeamMembers = async () => {
		setLoadingMembers(true);
		try {
			const promises = teams.map((team) => dispatch(loadTeamMembers(team.id)));
			await Promise.all(promises);
		} catch (error) {
			console.error("Erreur lors du chargement des membres:", error);
		} finally {
			setLoadingMembers(false);
		}
	};

	const loadTeams = async () => {
		try {
			if (user?.id) {
				const result = await dispatch(loadUserTeams(user.id));
				if (!result.success) {
					Toast.show({
						type: "error",
						text1: "Erreur",
						text2: result.error,
						position: "top",
						visibilityTime: 3000,
					});
				}
			}
		} catch (error) {
			console.error("Erreur lors du chargement des équipes:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Impossible de charger les équipes",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	const getMemberCount = (team) => {
		const members = teamMembers[team.id] || [];
		return members.length || team.members?.length || 0;
	};

	const handleRefresh = async () => {
		await loadTeams();
		if (teams && teams.length > 0) {
			await loadAllTeamMembers();
		}
	};

	const renderTeamItem = ({ item }) => {
		const memberCount = getMemberCount(item);
		return (
			<TouchableOpacity
				style={styles.teamItem}
				onPress={() => navigation.navigate("TeamDetails", { team: item })}>
				<View style={styles.teamInfo}>
					<Text style={styles.teamName}>{item.nom}</Text>
					<Text style={styles.memberCount}>
						{memberCount} {memberCount > 1 ? "membres" : "membre"}
					</Text>
				</View>
				<Icon name="chevron-right" size={24} color={colors.primary} />
			</TouchableOpacity>
		);
	};

	if (loading || loadingMembers) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Mes Équipes</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => navigation.navigate("CreateTeam")}>
					<Icon name="plus" size={24} color="#fff" />
				</TouchableOpacity>
			</View>

			<FlatList
				data={teams}
				renderItem={renderTeamItem}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							Vous n'avez pas encore d'équipe
						</Text>
						<Text style={styles.emptySubText}>
							Créez une équipe pour commencer
						</Text>
					</View>
				}
				refreshing={loading || loadingMembers}
				onRefresh={handleRefresh}
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
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
	},
	addButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	listContainer: {
		padding: 15,
	},
	teamItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
	},
	teamInfo: {
		flex: 1,
	},
	teamName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 5,
	},
	memberCount: {
		fontSize: 14,
		color: "#666",
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
	},
});

export default TeamScreen;
