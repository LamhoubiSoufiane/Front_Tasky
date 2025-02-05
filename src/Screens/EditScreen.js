import React,  {useEffect, useState} from "react";
import {
	View,
	StyleSheet,
	Image,
	Text,
	TouchableOpacity,
	SafeAreaView,
	StatusBar,
	TextInput,
	Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile, updateUserProfile } from "../Redux/actions/userActions";

export default function EditScreen({ navigation }) {
	// State for form fields
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [profileImage, setProfileImage] = useState(
		require("../../assets/defaultProfileImage.jpg")
	); // Default image
	/*
  // Function to handle image change
 const changeProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You need to allow access to your gallery to change the image.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setProfileImage({ uri: pickerResult.assets[0].uri });
    }
  };
*/

	// Function to handle image change
	const changeProfileImage = async () => {
		// Request media library permission
		const permissionResult =
			await ImagePicker.requestMediaLibraryPermissionsAsync();

		// Check permission status
		if (permissionResult.granted === false) {
			Alert.alert(
				"Permission Denied",
				"You need to allow access to your gallery to change the image."
			);
			return;
		}

		// If permission is granted, show the current permission status
		Alert.alert(
			"Permission Granted",
			"You have granted permission to access the gallery."
		);

		// Launch image picker to allow the user to choose an image
		const pickerResult = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 1,
		});

		// Check if the user has selected an image
		if (!pickerResult.canceled) {
			// Update the profile image with the selected image
			setProfileImage({ uri: pickerResult.assets[0].uri });
		} else {
			Alert.alert("Image Selection Cancelled", "You did not select an image.");
		}
	};

	const dispatch = useDispatch();
	const user = useSelector((state) => state.user.searchResults);

	useEffect(() => {
		dispatch(getUserProfile());
	  }, [dispatch]);
	
	  useEffect(() => {
		if (user && user.nom && user.prenom && user.username && user.email) {
		  setFirstName(user.nom);
		  setLastName(user.prenom);
		  setUsername(user.username);
		  setEmail(user.email);
		  setProfileImage(user.profileImage ? { uri: user.profileImage } : require("../../assets/defaultProfileImage.jpg"));
		}
	  }, [user]);

	if (user.loading) {
    return <Text>Loading...</Text>;
  }
  if (user.error) {
    return <Text>{user.error}</Text>;
  }



  	const handleSaveChanges = async () => {
		console.log("--------<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Valeurs actuelles :", {
			firstName,
			lastName,
			username,
			email
		});
		// Vérifiez si l'image a changé
		let imageUrl = profileImage.uri ? await uploadImageAsync(profileImage.uri) : null;

		const userData = {
			nom: firstName,
			prenom: lastName,
			username,
			email,
			imageUrl,
		};
		console.log(' ************************************************ User data to update:', userData); // Vérifie ce que tu envoies
		const result = await dispatch(updateUserProfile(userData));
		
		console.log('**************************************************Dispatch result:', result); // Vérifie la réponse du dispatch

		if (result.success) {
			// Si la mise à jour a réussi, tu peux afficher une alerte ou rediriger l'utilisateur.
			Alert.alert('Profile updated', 'Your profile has been successfully updated!');
			// Optionnellement, tu peux naviguer vers un autre écran.
			navigation.navigate("EditProfile"); // HomeScreen
		  } else {
			// Si la mise à jour échoue, tu peux afficher l'erreur.
			Alert.alert('Error', result.error);
		  }
	};
	

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

			{/* Header */}
			<View style={styles.headerContainer}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backButton}>
					<MaterialIcons name="keyboard-arrow-left" size={32} color="#000" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Edit Profile</Text>
			</View>

			{/* Profile Image Section */}
			<View style={styles.profileContainer}>
				<Image source={profileImage} style={styles.profileImage} />
				<TouchableOpacity
					style={styles.cameraButton}
					onPress={changeProfileImage}>
					<MaterialIcons name="photo-camera" size={32} color="#fff" />
				</TouchableOpacity>
			</View>

			{/* Form Section */}
			<View style={styles.formContainer}>
				{/* First Name */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>First Name</Text>
					<TextInput
						style={styles.input}
						value={firstName}
						onChangeText={setFirstName}
					/>
				</View>

				{/* Last Name */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Last Name</Text>
					<TextInput
						style={styles.input}
						value={lastName}
						onChangeText={setLastName}
					/>
				</View>

				{/* Username */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Username</Text>
					<TextInput
						style={styles.input}
						value={username}
						onChangeText={setUsername}
					/>
				</View>

				{/* Email */}
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.input}
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
					/>
				</View>

				{/* Save Button */}
				<TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
					<Text style={styles.saveButtonText}>Save Changes</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#ffffff",
		paddingHorizontal: 22,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 12,
		marginTop: 10,
	},
	backButton: {
		position: "absolute",
		left: 0,
	},
	headerTitle: {
		flex: 1,
		textAlign: "center",
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
	},
	profileContainer: {
		alignItems: "center",
		marginTop: 30,
	},
	profileImage: {
		height: 150,
		width: 150,
		borderRadius: 75,
		borderWidth: 2,
		borderColor: "#FF6347",
	},
	cameraButton: {
		position: "absolute",
		bottom: -1, // Updated to move closer vertically
		right: 100, // Updated to move closer horizontally
		backgroundColor: "#FF6347",
		borderRadius: 20,
		padding: 5,
		elevation: 5,
	},
	formContainer: {
		marginTop: 30,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		fontSize: 16,
		color: "#333",
		backgroundColor: "#f9f9f9",
	},
	saveButton: {
		backgroundColor: "#4c669f",
		paddingVertical: 15,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
	saveButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});
