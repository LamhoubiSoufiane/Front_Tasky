import React, { useMemo, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	FlatList,
	ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers } from '../Redux/actions/userActions';
import { colors } from '../assets/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';

const AddProjectMemberScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const dispatch = useDispatch();
	
	const { projectId, onMemberAdd } = route.params;
	const [loading, setLoading] = React.useState(false);
	const [searchResults, setSearchResults] = React.useState([]);
	const { projectMembers } = useSelector((state) => state.project);
	const currentMembers = projectMembers[projectId] || [];

	const handleBackPress = useCallback(() => {
		navigation?.goBack();
	}, [navigation]);

	const handleSearch = useCallback(async (query) => {
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
					type: 'error',
					text1: 'Erreur',
					text2: result.error || "Erreur lors de la recherche",
					position: 'top',
					visibilityTime: 3000,
				});
			}
		} catch (error) {
			console.error("Erreur de recherche:", error);
			Toast.show({
				type: 'error',
				text1: 'Erreur',
				text2: "Impossible d'effectuer la recherche",
				position: 'top',
				visibilityTime: 3000,
			});
		} finally {
			setLoading(false);
		}
	}, [dispatch]);

	const handleUserPress = useCallback(async (user) => {
		if (currentMembers.some(member => member.id === user.id)) {
			Toast.show({
				type: 'error',
				text1: 'Erreur',
				text2: "Cet utilisateur est déjà membre du projet",
				position: 'top',
				visibilityTime: 3000,
			});
			return;
		}

		try {
			await onMemberAdd(user.id);
			navigation.goBack();
		} catch (error) {
			console.error("Erreur lors de l'ajout:", error);
			Toast.show({
				type: 'error',
				text1: 'Erreur',
				text2: "Impossible d'ajouter le membre",
				position: 'top',
				visibilityTime: 3000,
			});
		}
	}, [currentMembers, onMemberAdd, navigation]);

	const renderHeader = useMemo(() => (
		<View style={styles.header}>
			<TouchableOpacity
				style={styles.backButton}
				onPress={handleBackPress}>
				<Icon name="arrow-left" size={24} color="#fff" />
			</TouchableOpacity>
			<Text style={styles.title}>Ajouter un membre</Text>
			<View style={styles.placeholder} />
		</View>
	), [handleBackPress]);

	const renderSearchBar = useMemo(() => (
		<View style={styles.searchContainer}>
			<Icon name="magnify" size={24} color={colors.primary} style={styles.searchIcon} />
			<TextInput
				style={styles.searchInput}
				placeholder="Rechercher un utilisateur..."
				onChangeText={handleSearch}
				autoCapitalize="none"
			/>
		</View>
	), [handleSearch]);

	const renderUserItem = useCallback(({ item: user }) => (
		<TouchableOpacity
			style={styles.userItem}
			onPress={() => handleUserPress(user)}>
			<View style={styles.userInfo}>
				<Text style={styles.username}>{user.username}</Text>
				<Text style={styles.email}>{user.email}</Text>
			</View>
			<Icon name="plus-circle" size={24} color={colors.primary} />
		</TouchableOpacity>
	), [handleUserPress]);

	const EmptyList = useMemo(() => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>
				Commencez à taper pour rechercher des utilisateurs
			</Text>
		</View>
	), []);

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
			{renderSearchBar}
			<FlatList
				data={searchResults}
				renderItem={renderUserItem}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
				ListEmptyComponent={EmptyList}
			/>
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
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 15,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	searchIcon: {
		marginRight: 10,
	},
	searchInput: {
		flex: 1,
		height: 40,
		fontSize: 16,
		color: '#333',
	},
	listContainer: {
		padding: 15,
		flexGrow: 1,
	},
	userItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	userInfo: {
		flex: 1,
	},
	username: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 5,
	},
	email: {
		fontSize: 14,
		color: '#666',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 50,
	},
	emptyText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
});

export default AddProjectMemberScreen; 