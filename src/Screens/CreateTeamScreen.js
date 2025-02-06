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
			<View style={styles.headerBackground} />
			<View style={styles.headerGradient} />
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
				style={styles.scrollView}
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
		backgroundColor: "#eef2f3",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		padding: 25,
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
	placeholder: {
		width: 42,
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
	formContainer: {
		padding: 25,
		backgroundColor: "#fff",
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
		marginTop: 10,
	},
	label: {
		fontSize: 18,
		fontWeight: "700",
		color: "#2c3e50",
		marginBottom: 12,
		letterSpacing: 0.3,
	},
	input: {
		height: 55,
		borderWidth: 2,
		borderColor: "#e0e7ff",
		borderRadius: 15,
		paddingHorizontal: 20,
		fontSize: 16,
		color: "#2c3e50",
		backgroundColor: "#f8faff",
		marginBottom: 25,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	createButton: {
		backgroundColor: "#4c669f",
		height: 55,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.25,
		shadowRadius: 5,
		marginTop: 10,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
});

export default CreateTeamScreen;
