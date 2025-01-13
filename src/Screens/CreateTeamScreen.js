import React, { useMemo, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { createTeam } from "../Redux/actions/teamActions";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

const CreateTeamScreen = () => {
	const navigation = useNavigation();
	const dispatch = useDispatch();
	
	const user = useSelector((state) => state.auth.user);
	const { loading } = useSelector((state) => state.team);

	const handleCreateTeam = useCallback(async (teamName) => {
		if (!teamName?.trim() || !user?.id) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Veuillez entrer un nom d'équipe valide",
				position: "top",
				visibilityTime: 3000,
			});
			return;
		}

		try {
			const result = await dispatch(createTeam({
				nom: teamName.trim(),
				ownerId: user.id,
				members: [user],
			}));

			if (result.success) {
				Toast.show({
					type: "success",
					text1: "Succès",
					text2: "Équipe créée avec succès",
					position: "top",
					visibilityTime: 3000,
				});
				navigation?.goBack();
			} else {
				Toast.show({
					type: "error",
					text1: "Erreur",
					text2: result.error || "Erreur lors de la création de l'équipe",
					position: "top",
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Erreur lors de la création de l'équipe:", error);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Impossible de créer l'équipe",
				position: "top",
				visibilityTime: 3000,
			});
		}
	}, [dispatch, user, navigation]);

	const handleBackPress = useCallback(() => {
		navigation?.goBack();
	}, [navigation]);

	const renderHeader = useMemo(() => (
		<View style={styles.header}>
			<TouchableOpacity
				style={styles.backButton}
				onPress={handleBackPress}>
				<Icon name="arrow-left" size={24} color="#fff" />
			</TouchableOpacity>
			<Text style={styles.title}>Créer une équipe</Text>
			<View style={styles.placeholder} />
		</View>
	), [handleBackPress]);

	const renderForm = useCallback(({ teamName, setTeamName, onSubmit }) => (
		<View style={styles.formContainer}>
			<Text style={styles.label}>Nom de l'équipe</Text>
			<TextInput
				style={styles.input}
				placeholder="Entrez le nom de l'équipe"
				value={teamName}
				onChangeText={setTeamName}
				autoCapitalize="none"
				autoCorrect={false}
			/>
			<TouchableOpacity
				style={[
					styles.createButton,
					{ opacity: !teamName.trim() || loading ? 0.7 : 1 },
				]}
				onPress={onSubmit}
				disabled={!teamName.trim() || loading}>
				{loading ? (
					<ActivityIndicator color="#fff" size="small" />
				) : (
					<Text style={styles.buttonText}>Créer l'équipe</Text>
				)}
			</TouchableOpacity>
		</View>
	), [loading]);

	const FormContainer = useCallback(() => {
		const [teamName, setTeamName] = React.useState("");

		const onSubmit = () => {
			handleCreateTeam(teamName);
		};

		return renderForm({ teamName, setTeamName, onSubmit });
	}, [handleCreateTeam, renderForm]);

	return (
		<View style={styles.container}>
			{renderHeader}
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled">
				<FormContainer />
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	scrollContent: {
		flexGrow: 1,
		padding: 20,
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
	placeholder: {
		width: 40,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
	},
	formContainer: {
		padding: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 10,
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		color: "#333",
		backgroundColor: "#f9f9f9",
		marginBottom: 20,
	},
	createButton: {
		backgroundColor: colors.primary,
		height: 50,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default CreateTeamScreen;
