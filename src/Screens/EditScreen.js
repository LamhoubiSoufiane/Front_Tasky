import React, { useEffect, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile, updateUserProfile } from "../Redux/actions/userActions";
import { API_BASE_URL } from "../config";

export default function EditScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);

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
      if (user.imageUrl) {
        const correctedImageUrl = user.imageUrl.replace('http://localhost:3000', API_BASE_URL);
        console.log("Setting initial profile image:", correctedImageUrl);
        setProfileImage({ 
          uri: correctedImageUrl,
          type: 'image/jpeg',
          name: user.imageUrl.split('/').pop()
        });
      }
    }
  }, [user]);

  const changeProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Vous devez autoriser l\'accès à votre galerie pour modifier l\'image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        console.log('Image sélectionnée:', selectedImage);
        
        const uniqueFileName = `${user.email.split('@')[0]}_${Date.now()}.jpg`;
        console.log('Nom unique du fichier:', uniqueFileName);
        
        setProfileImage({
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: uniqueFileName
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du choix de l\'image.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const userData = {
        nom: firstName,
        prenom: lastName,
        username,
        email
      };

      console.log('Données du profil à mettre à jour:', userData);
      console.log('Image à uploader:', profileImage);

      const result = await dispatch(updateUserProfile(userData, profileImage));
      
      if (result.success) {
        Alert.alert('Succès', 'Votre profil a été mis à jour avec succès !');
        navigation.navigate("Profile");
      } else {
        Alert.alert('Erreur', result.error || 'Une erreur est survenue lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du profil');
    }
  };

  const renderProfileImage = () => {
    if (profileImage && profileImage.uri) {
      console.log("Affichage de l'image:", profileImage.uri);
      return (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: profileImage.uri }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.imageOverlay}
            onPress={changeProfileImage}
            activeOpacity={0.7}
          >
            <MaterialIcons name="photo-camera" size={24} color="#fff" />
            <Text style={styles.changePhotoOverlayText}>Changer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.imageWrapper, styles.defaultImageContainer]}
        onPress={changeProfileImage}
      >
        <View style={styles.addPhotoContainer}>
          <MaterialIcons name="add-a-photo" size={40} color="#4c669f" />
          <Text style={styles.addPhotoText}>Ajouter une photo</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (user.loading) {
    return <Text>Loading...</Text>;
  }
  if (user.error) {
    return <Text>{user.error}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="keyboard-arrow-left" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
      </View>

      {/* Profile Image Section */}
      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          {renderProfileImage()}
        </View>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

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
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    marginBottom: 10,
    borderRadius: 75,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
  },
  defaultImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#4c669f',
    borderStyle: 'dashed',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoOverlayText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
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
  addPhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    color: '#4c669f',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});
