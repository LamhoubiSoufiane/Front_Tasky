import React, { useMemo, useCallback } from "react";
import {
	SafeAreaView,
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loadUserTeams, loadTeamMembers } from "../Redux/actions/teamActions";
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
			<Icon name="chevron-right" size={24} color="#4c669f" />
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
				style={[styles.addButton, { marginTop: 20 }]}
				onPress={handleLoadTeams}>
				<Text style={styles.buttonText}>Charger les équipes</Text>
			</TouchableOpacity>
		</View>
	), [handleLoadTeams]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#4c669f" />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerBackground} />
				<View style={styles.headerGradient} />
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
		</SafeAreaView>
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
		marginTop: -50,
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
	title: {
		fontSize: 32,
		fontWeight: "900",
		color: "#fff",
		letterSpacing: 1,
		textShadowColor: 'rgba(0, 0, 0, 0.25)',
		textShadowOffset: { width: 0, height: 3 },
		textShadowRadius: 4,
		position: 'relative',
		zIndex: 2,
	},
	addButton: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "rgba(255, 255, 255, 0.4)",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 5,
		position: 'relative',
		zIndex: 2,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	listContainer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
		flexGrow: 1,
	},
	teamItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 22,
		borderRadius: 16,
		marginBottom: 15,
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		transform: [{ scale: 1 }],
	},
	teamInfo: {
		flex: 1,
		marginLeft: 5,
	},
	teamName: {
		fontSize: 20,
		fontWeight: "800",
		color: "#2c3e50",
		marginBottom: 6,
		letterSpacing: 0.3,
	},
	memberCount: {
		fontSize: 15,
		color: "#7f8c8d",
		fontWeight: "500",
		letterSpacing: 0.2,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 25,
		paddingVertical: 40,
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
});

export default TeamScreen;
