import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Modal,
	TextInput,
	ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addTeamMember, removeTeamMember } from "../Redux/actions/teamActions";
import { searchUsers } from "../Redux/actions/userActions";
import { colors } from "../assets/colors";
import Toast from "react-native-toast-message";

const TeamMembersTab = ({ team, members }) => {
	const dispatch = useDispatch();
	const { user: currentUser } = useSelector((state) => state.auth);
	const [modalVisible, setModalVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleSearch = async (query) => {
		setSearchQuery(query);
		if (query.trim().length < 2) {
			setSearchResults([]);
			return;
		}

		try {
			const result = await dispatch(searchUsers(query));
			if (result.success) {
				// Filtrer les utilisateurs qui ne sont pas déjà membres
				const filteredUsers = result.data.filter(
					(user) => !members.some((member) => member.id === user.id)
				);
				setSearchResults(filteredUsers);
			}
		} catch (error) {
			console.error("Erreur de recherche:", error);
		}
	};

	const handleAddMember = async (userId) => {
		setLoading(true);
		try {
			const result = await dispatch(addTeamMember(team.id, userId));
			if (result.success) {
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: result.message,
					position: "top",
					visibilityTime: 3000,
				});
				setModalVisible(false);
				setSearchQuery("");
				setSearchResults([]);
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error,
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Une erreur est survenue",
				position: "top",
				visibilityTime: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveMember = async (userId) => {
		try {
			const result = await dispatch(removeTeamMember(team.id, userId));
			if (result.success) {
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: result.message,
					position: "top",
					visibilityTime: 3000,
				});
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error,
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Une erreur est survenue",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	const renderMemberItem = ({ item }) => (
		<View style={styles.memberItem}>
			<View style={styles.memberInfo}>
				<Text style={styles.memberName}>{item.username}</Text>
				<Text style={styles.memberEmail}>{item.email}</Text>
				{item.id === team.owner.id && (
					<Text style={styles.ownerBadge}>Propriétaire</Text>
				)}
			</View>
			{currentUser.id === team.owner.id && item.id !== team.owner.id && (
				<TouchableOpacity
					style={styles.removeButton}
					onPress={() => handleRemoveMember(item.id)}>
					<Text style={styles.removeButtonText}>-</Text>
				</TouchableOpacity>
			)}
		</View>
	);

	const renderSearchResult = ({ item }) => (
		<TouchableOpacity
			style={styles.searchResultItem}
			onPress={() => handleAddMember(item.id)}>
			<Text style={styles.memberName}>{item.username}</Text>
			<Text style={styles.memberEmail}>{item.email}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{currentUser.id === team.owner.id && (
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => setModalVisible(true)}>
					<Text style={styles.addButtonText}>Ajouter un membre</Text>
				</TouchableOpacity>
			)}

			<FlatList
				data={members}
				renderItem={renderMemberItem}
				keyExtractor={(item) => item.id.toString()}
				ListEmptyComponent={
					<Text style={styles.emptyText}>Aucun membre dans cette équipe</Text>
				}
			/>

			<Modal
				visible={modalVisible}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setModalVisible(false)}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Ajouter un membre</Text>
						<TextInput
							style={styles.searchInput}
							placeholder="Rechercher un utilisateur..."
							value={searchQuery}
							onChangeText={handleSearch}
						/>
						{loading ? (
							<ActivityIndicator size="large" color={colors.primary} />
						) : (
							<FlatList
								data={searchResults}
								renderItem={renderSearchResult}
								keyExtractor={(item) => item.id.toString()}
								ListEmptyComponent={
									searchQuery.length >= 2 && (
										<Text style={styles.emptyText}>
											Aucun utilisateur trouvé
										</Text>
									)
								}
							/>
						)}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => {
								setModalVisible(false);
								setSearchQuery("");
								setSearchResults([]);
							}}>
							<Text style={styles.closeButtonText}>Fermer</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
	},
	memberItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
	},
	memberInfo: {
		flex: 1,
	},
	memberName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 5,
	},
	memberEmail: {
		fontSize: 14,
		color: "#666",
	},
	ownerBadge: {
		position: "absolute",
		right: 15,
		top: 15,
		backgroundColor: colors.primary,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 15,
		color: "#fff",
		fontSize: 12,
	},
	removeButton: {
		backgroundColor: "#ff4444",
		width: 30,
		height: 30,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 10,
	},
	removeButtonText: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
	},
	addButton: {
		backgroundColor: colors.primary,
		padding: 15,
		borderRadius: 10,
		marginBottom: 15,
		alignItems: "center",
	},
	addButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	emptyText: {
		textAlign: "center",
		color: "#666",
		marginTop: 20,
		fontSize: 16,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		padding: 20,
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
		maxHeight: "80%",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: colors.primary,
		marginBottom: 15,
		textAlign: "center",
	},
	searchInput: {
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		marginBottom: 15,
		fontSize: 16,
	},
	searchResultItem: {
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
	},
	closeButton: {
		backgroundColor: "#666",
		padding: 15,
		borderRadius: 10,
		marginTop: 15,
		alignItems: "center",
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default TeamMembersTab;
