import React, { useMemo, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ScrollView,
	ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../Redux/actions/projectActions';
import { colors } from '../assets/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
/*import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
	nom: Yup.string()
		.required('Le nom du projet est requis')
		.min(3, 'Le nom doit contenir au moins 3 caractères'),
	description: Yup.string()
		.required('La description est requise')
		.min(10, 'La description doit contenir au moins 10 caractères'),
});*/

const CreateProjectScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const dispatch = useDispatch();
	
	const { teamId } = route.params;
	const { loading } = useSelector((state) => state.project);
	const user = useSelector((state) => state.auth.user);

	const handleBackPress = useCallback(() => {
		navigation?.goBack();
	}, [navigation]);

	const handleSubmit = useCallback(async (values) => {
		try {
			const projectData = {
				...values,
				teamId,
				ownerId: user.id,
			};

			const result = await dispatch(createProject(projectData));
			if (result.success) {
				Toast.show({
					type: 'success',
					text1: 'Succès',
					text2: 'Projet créé avec succès',
					position: 'top',
					visibilityTime: 3000,
				});
				navigation.goBack();
			} else {
				Toast.show({
					type: 'error',
					text1: 'Erreur',
					text2: result.error || "Impossible de créer le projet",
					position: 'top',
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Erreur lors de la création:", error);
			Toast.show({
				type: 'error',
				text1: 'Erreur',
				text2: "Impossible de créer le projet",
				position: 'top',
				visibilityTime: 3000,
			});
		}
	}, [dispatch, teamId, user?.id, navigation]);

	const renderHeader = useMemo(() => (
		<View style={styles.header}>
			<TouchableOpacity
				style={styles.backButton}
				onPress={handleBackPress}>
				<Icon name="arrow-left" size={24} color="#fff" />
			</TouchableOpacity>
			<Text style={styles.title}>Créer un projet</Text>
			<View style={styles.placeholder} />
		</View>
	), [handleBackPress]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{renderHeader}
			<ScrollView 
				style={styles.formContainer}
				keyboardShouldPersistTaps="handled"
			>
					{({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
						<View style={styles.form}>
							<View style={styles.inputContainer}>
								<Text style={styles.label}>Nom du projet</Text>
								<TextInput
									style={[
										styles.input,
										touched.nom && errors.nom && styles.inputError,
									]}
									placeholder="Entrez le nom du projet"
									value={values.nom}
									onChangeText={handleChange('nom')}
									onBlur={handleBlur('nom')}
								/>
								{touched.nom && errors.nom && (
									<Text style={styles.errorText}>{errors.nom}</Text>
								)}
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.label}>Description</Text>
								<TextInput
									style={[
										styles.input,
										styles.textArea,
										touched.description && errors.description && styles.inputError,
									]}
									placeholder="Décrivez votre projet"
									value={values.description}
									onChangeText={handleChange('description')}
									onBlur={handleBlur('description')}
									multiline
									numberOfLines={4}
									textAlignVertical="top"
								/>
								{touched.description && errors.description && (
									<Text style={styles.errorText}>{errors.description}</Text>
								)}
							</View>

							<TouchableOpacity
								style={styles.submitButton}
								onPress={handleSubmit}
								disabled={loading}
							>
								<Text style={styles.submitButtonText}>
									{loading ? 'Création...' : 'Créer le projet'}
								</Text>
							</TouchableOpacity>
						</View>
					)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		paddingTop: 60,
		backgroundColor: colors.primary,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	placeholder: {
		width: 40,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#fff',
	},
	formContainer: {
		flex: 1,
		padding: 20,
	},
	form: {
		flex: 1,
	},
	inputContainer: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	input: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		color: '#333',
	},
	textArea: {
		height: 120,
		textAlignVertical: 'top',
	},
	inputError: {
		borderColor: 'red',
	},
	errorText: {
		color: 'red',
		fontSize: 12,
		marginTop: 5,
	},
	submitButton: {
		backgroundColor: colors.primary,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 20,
	},
	submitButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});

export default CreateProjectScreen; 