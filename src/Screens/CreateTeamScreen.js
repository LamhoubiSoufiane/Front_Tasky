import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { createTeam } from "../Redux/actions/teamActions";
import { searchUsers } from "../Redux/actions/userActions";
import { colors } from "../assets/colors";
import Toast from "react-native-toast-message";

const CreateTeamScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.auth);
	const [teamName, setTeamName] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [selectedMembers, setSelectedMembers] = useState([]);
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
				setSearchResults(result.data.filter((u) => u.id !== user.id));
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error || "Erreur lors de la recherche d'utilisateurs",
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Erreur de recherche:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Erreur lors de la recherche d'utilisateurs",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	const toggleMemberSelection = (member) => {
		if (selectedMembers.some((m) => m.id === member.id)) {
			setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id));
		} else {
			setSelectedMembers([...selectedMembers, member]);
		}
	};

	const handleCreateTeam = async () => {
		if (!teamName.trim()) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Veuillez entrer un nom d'équipe",
				position: "top",
				visibilityTime: 3000,
			});
			return;
		}

		setLoading(true);
		try {
			const teamData = {
				nom: teamName.trim(),
				memberIds: selectedMembers.map((member) => member.id),
				ownerId: user.id,
			};

			const result = await dispatch(createTeam(teamData));

			if (result.success) {
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: result.message,
					position: "top",
					visibilityTime: 2000,
					onHide: () => {
						navigation.goBack();
					},
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
				text2: "Une erreur est survenue lors de la création de l'équipe",
				position: "top",
				visibilityTime: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	const renderMemberItem = ({ item }) => (
		<TouchableOpacity
			style={[
				styles.memberItem,
				selectedMembers.some((m) => m.id === item.id) && styles.selectedMember,
			]}
			onPress={() => toggleMemberSelection(item)}>
			<Text style={styles.memberName}>{item.username}</Text>
			<Text style={styles.memberEmail}>{item.email}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Créer une équipe</Text>

			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Nom de l'équipe"
					value={teamName}
					onChangeText={setTeamName}
				/>
			</View>

			<View style={styles.searchContainer}>
				<TextInput
					style={styles.searchInput}
					placeholder="Rechercher des membres..."
					value={searchQuery}
					onChangeText={handleSearch}
				/>
			</View>

			<Text style={styles.subtitle}>
				Membres sélectionnés ({selectedMembers.length})
			</Text>

			<FlatList
				data={searchQuery ? searchResults : selectedMembers}
				renderItem={renderMemberItem}
				keyExtractor={(item) => item.id.toString()}
				style={styles.list}
			/>

			<TouchableOpacity
				style={[styles.button, loading && styles.buttonDisabled]}
				onPress={handleCreateTeam}
				disabled={loading}>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<Text style={styles.buttonText}>Créer l'équipe</Text>
				)}
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: colors.primary,
		marginBottom: 20,
	},
	inputContainer: {
		marginBottom: 20,
	},
	input: {
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "#eee",
	},
	searchContainer: {
		marginBottom: 20,
	},
	searchInput: {
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "#eee",
	},
	subtitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 10,
	},
	list: {
		flex: 1,
		marginBottom: 20,
	},
	memberItem: {
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
	},
	selectedMember: {
		backgroundColor: `${colors.primary}20`,
		borderColor: colors.primary,
		borderWidth: 1,
	},
	memberName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	memberEmail: {
		fontSize: 14,
		color: "#666",
		marginTop: 5,
	},
	button: {
		backgroundColor: colors.primary,
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
});

export default CreateTeamScreen;
