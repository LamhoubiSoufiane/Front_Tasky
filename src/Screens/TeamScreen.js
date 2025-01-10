import React, { useMemo, useCallback } from "react";
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
import { useNavigation } from "@react-navigation/native";

const TeamScreen = () => {
	const navigation = useNavigation();
	const dispatch = useDispatch();
	
	const user = useSelector((state) => state.auth.user);
	const { loading, teams, teamMembers } = useSelector((state) => state.team);

	const teamData = useMemo(() => {
		if (!teams) return [];
		return teams.map(team => ({
			...team,
			memberCount: teamMembers[team.id]?.length || team.members?.length || 0
		}));
	}, [teams, teamMembers]);

	const loadAllTeamMembers = useCallback(async (currentTeams) => {
		if (!currentTeams?.length) return;
		try {
			await Promise.all(currentTeams.map((team) => dispatch(loadTeamMembers(team.id))));
		} catch (error) {
			console.error("Erreur lors du chargement des membres:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Impossible de charger les membres",
				position: "top",
				visibilityTime: 3000,
			});
		}
	}, [dispatch]);

	const handleLoadTeams = useCallback(async () => {
		if (!user?.id) return;
		try {
			const result = await dispatch(loadUserTeams(user.id));
			if (result.success && result.teams?.length > 0) {
				await loadAllTeamMembers(result.teams);
			} else if (!result.success) {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error,
					position: "top",
						visibilityTime: 3000,
				});
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
	}, [user?.id, dispatch, loadAllTeamMembers]);

	const handleTeamPress = useCallback((team) => {
		navigation?.navigate("TeamDetails", { team });
	}, [navigation]);

	const handleCreateTeamPress = useCallback(() => {
		navigation?.navigate("CreateTeam");
	}, [navigation]);

	const renderTeamItem = useCallback(({ item }) => (
		<TouchableOpacity
			style={styles.teamItem}
			onPress={() => handleTeamPress(item)}>
			<View style={styles.teamInfo}>
				<Text style={styles.teamName}>{item.nom}</Text>
				<Text style={styles.memberCount}>
					{item.memberCount} {item.memberCount > 1 ? "membres" : "membre"}
				</Text>
			</View>
			<Icon name="chevron-right" size={24} color={colors.primary} />
		</TouchableOpacity>
	), [handleTeamPress]);

	const EmptyComponent = useMemo(() => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>
				Vous n'avez pas encore d'équipe
			</Text>
			<Text style={styles.emptySubText}>
				Créez une équipe pour commencer
			</Text>
			<TouchableOpacity
				style={[styles.addButton, { marginTop: 20, backgroundColor: colors.primary }]}
				onPress={handleLoadTeams}>
				<Text style={styles.buttonText}>Charger les équipes</Text>
			</TouchableOpacity>
		</View>
	), [handleLoadTeams]);

	if (loading) {
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
					onPress={handleCreateTeamPress}>
					<Icon name="plus" size={24} color="#fff" />
				</TouchableOpacity>
			</View>

			<FlatList
				data={teamData}
				renderItem={renderTeamItem}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
				ListEmptyComponent={EmptyComponent}
				refreshing={loading}
				onRefresh={handleLoadTeams}
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
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		paddingHorizontal: 20,
	},
	listContainer: {
		padding: 15,
		flexGrow: 1,
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
		marginBottom: 20,
	},
});

export default TeamScreen;
