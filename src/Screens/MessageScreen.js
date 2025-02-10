import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { fetchAllPendingHelpRequests, acceptHelpRequest, completeHelpRequest } from "../Redux/actions/helpRequestActions";
import Toast from "react-native-toast-message";

const HelpRequestCard = ({ request, onAccept, onComplete, currentUserId }) => {
	console.log("Rendering help request:", request); // Log pour déboguer
	const isHelper = request.helperId === currentUserId;
	const isPending = request.status === "en_attente";

	return (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<Icon 
					name={isPending ? "help-outline" : "help"} 
					size={24} 
					color={isPending ? colors.warning : colors.success} 
				/>
				<Text style={styles.taskName}>
					{request.task?.nom || "Tâche sans nom"}
				</Text>
			</View>
			
			<Text style={styles.description}>{request.description}</Text>
			
			<View style={styles.userInfo}>
				<Icon name="person" size={16} color={colors.textGray} />
				<Text style={styles.userName}>
					{request.demandeur?.username || "Utilisateur inconnu"}
				</Text>
			</View>

			<View style={styles.projectInfo}>
				<Icon name="folder" size={16} color={colors.textGray} />
				<Text style={styles.projectName}>
					{request.task?.projet?.nom || "Projet inconnu"}
				</Text>
			</View>

			<View style={styles.cardFooter}>
				{isPending ? (
					<TouchableOpacity 
						style={[styles.button, styles.acceptButton]}
						onPress={() => onAccept(request.id)}
					>
						<Icon name="check" size={20} color="#fff" />
						<Text style={styles.buttonText}>Accepter</Text>
					</TouchableOpacity>
				) : isHelper && !request.completed ? (
					<TouchableOpacity 
						style={[styles.button, styles.completeButton]}
						onPress={() => onComplete(request.id)}
					>
						<Icon name="done-all" size={20} color="#fff" />
						<Text style={styles.buttonText}>Terminer</Text>
					</TouchableOpacity>
				) : (
					<View style={[styles.button, styles.completedButton]}>
						<Icon name="check-circle" size={20} color="#fff" />
						<Text style={styles.buttonText}>
							{request.completed ? "Terminé" : "En cours"}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};

const MessageScreen = () => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	
	const currentUser = useSelector(state => state.auth.user);
	const helpRequests = useSelector(state => state.helpRequest?.pendingRequests || []);

	console.log("Current user:", currentUser); // Log pour déboguer
	console.log("Help requests in MessageScreen:", helpRequests); // Log pour déboguer

	const loadHelpRequests = useCallback(async () => {
		try {
			setIsLoading(true);
			console.log("Chargement des demandes d'aide...");
			
			const result = await dispatch(fetchAllPendingHelpRequests());
			if (!result.success) {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error || "Impossible de charger les demandes d'aide",
					position: "top",
				});
			}
		} catch (error) {
			console.error("Erreur lors du chargement des demandes d'aide:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Une erreur est survenue lors du chargement des demandes",
				position: "top",
			});
		} finally {
			setIsLoading(false);
		}
	}, [dispatch]);

	useEffect(() => {
		loadHelpRequests();
	}, [loadHelpRequests]);

	const handleAccept = useCallback(async (requestId) => {
		try {
			const result = await dispatch(acceptHelpRequest(requestId));
			if (result.success) {
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: "Demande d'aide acceptée",
					position: "top",
				});
				loadHelpRequests();
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error || "Impossible d'accepter la demande",
					position: "top",
				});
			}
		} catch (error) {
			console.error("Erreur lors de l'acceptation de la demande:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Une erreur est survenue",
				position: "top",
			});
		}
	}, [dispatch, loadHelpRequests]);

	const handleComplete = useCallback(async (requestId) => {
		try {
			const result = await dispatch(completeHelpRequest(requestId));
			if (result.success) {
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: "Demande d'aide terminée",
					position: "top",
				});
				loadHelpRequests();
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error || "Impossible de terminer la demande",
					position: "top",
				});
			}
		} catch (error) {
			console.error("Erreur lors de la complétion de la demande:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Une erreur est survenue",
				position: "top",
			});
		}
	}, [dispatch, loadHelpRequests]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadHelpRequests();
		setRefreshing(false);
	}, [loadHelpRequests]);

	const renderHelpRequestCard = useCallback(({ item }) => {
		console.log("Rendering item:", item); // Log pour déboguer
		return (
			<HelpRequestCard
				request={item}
				onAccept={handleAccept}
				onComplete={handleComplete}
				currentUserId={currentUser?.id}
			/>
		);
	}, [handleAccept, handleComplete, currentUser?.id]);

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={styles.loadingText}>Chargement des demandes d'aide...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Demandes d'aide</Text>
			</View>
			<FlatList
				data={helpRequests}
				renderItem={renderHelpRequestCard}
				keyExtractor={(item) => `help-request-${item.id}`}
				contentContainerStyle={styles.listContainer}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.primary]}
					/>
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Icon name="inbox" size={50} color={colors.textGray} />
						<Text style={styles.emptyText}>
							Aucune demande d'aide en attente
						</Text>
					</View>
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		backgroundColor: "#4c669f",
		padding: 20,
		paddingTop: 60,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	listContainer: {
		padding: 16,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	taskName: {
		fontSize: 18,
		fontWeight: "600",
		marginLeft: 8,
		color: "#2c3e50",
		flex: 1,
	},
	description: {
		fontSize: 14,
		color: "#7f8c8d",
		marginBottom: 12,
		lineHeight: 20,
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	projectInfo: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	userName: {
		marginLeft: 8,
		fontSize: 14,
		color: colors.textGray,
	},
	projectName: {
		marginLeft: 8,
		fontSize: 14,
		color: colors.textGray,
	},
	cardFooter: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginLeft: 8,
	},
	acceptButton: {
		backgroundColor: colors.primary,
	},
	completeButton: {
		backgroundColor: colors.success,
	},
	completedButton: {
		backgroundColor: colors.textGray,
	},
	buttonText: {
		color: "#fff",
		marginLeft: 4,
		fontSize: 14,
		fontWeight: "600",
	},
	emptyContainer: {
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	emptyText: {
		marginTop: 16,
		fontSize: 16,
		color: colors.textGray,
		textAlign: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: colors.textGray,
		textAlign: "center",
	},
});

export default MessageScreen;
