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
import { useDispatch } from "react-redux";
import { searchUsers } from "../Redux/actions/userActions";
import { addTeamMember } from "../Redux/actions/teamActions";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

const AddMemberScreen = ({ route, navigation }) => {
	const { team } = route.params;
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleSearch = async (query) => {
		setSearchQuery(query);
		if (query.trim().length < 2) {
			setSearchResults([]);
			return;
		}

		setLoading(true);
		try {
			const result = await dispatch(searchUsers(query));
			if (result.success) {
				setSearchResults(result.data);
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
				text2: "Erreur lors de la recherche",
				position: "top",
				visibilityTime: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleAddMember = async (userId) => {
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
				navigation.goBack();
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
				text2: "Erreur lors de l'ajout du membre",
				position: "top",
				visibilityTime: 3000,
			});
		}
	};

	const renderUserItem = ({ item }) => (
		<TouchableOpacity
			style={styles.userItem}
			onPress={() => handleAddMember(item.id)}>
			<View style={styles.userInfo}>
				<Text style={styles.userName}>{item.username}</Text>
				<Text style={styles.userEmail}>{item.email}</Text>
			</View>
			<Icon name="plus-circle" size={24} color={colors.primary} />
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}>
					<Icon name="arrow-left" size={30} color="#fff" />
				</TouchableOpacity>
				<Text style={styles.title}>Ajouter un membre</Text>
			</View>

			<View style={styles.content}>
				<View style={styles.searchContainer}>
					<Icon
						name="magnify"
						size={24}
						color="#666"
						style={styles.searchIcon}
					/>
					<TextInput
						style={styles.searchInput}
						placeholder="Rechercher un utilisateur..."
						value={searchQuery}
						onChangeText={handleSearch}
					/>
				</View>

				{loading ? (
					<ActivityIndicator
						size="large"
						color={colors.primary}
						style={styles.loader}
					/>
				) : (
					<FlatList
						data={searchResults}
						renderItem={renderUserItem}
						keyExtractor={(item) => item.id.toString()}
						ListEmptyComponent={
							searchQuery.length >= 2 && (
								<Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
							)
						}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		backgroundColor: colors.primary,
		padding: 20,
		paddingTop: 60,
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		padding: 10,
		marginRight: 10,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
	},
	content: {
		flex: 1,
		padding: 20,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 20,
	},
	searchIcon: {
		marginRight: 10,
	},
	searchInput: {
		flex: 1,
		paddingVertical: 15,
		fontSize: 16,
	},
	userItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
	},
	userInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 5,
	},
	userEmail: {
		fontSize: 14,
		color: "#666",
	},
	loader: {
		marginTop: 20,
	},
	emptyText: {
		textAlign: "center",
		color: "#666",
		marginTop: 20,
		fontSize: 16,
	},
});

export default AddMemberScreen;
