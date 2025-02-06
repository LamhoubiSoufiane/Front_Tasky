import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../Redux/actions/userActions";
import { API_BASE_URL } from "../config";

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.searchResults);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log("Données utilisateur reçues:", user);
    if (user && user.imageUrl) {
      console.log("URL de l'image reçue:", user.imageUrl);
    }
  }, [user]);

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setImageError(false);
      dispatch(getUserProfile());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  const renderProfileImage = () => {
    if (!user || !user.imageUrl) {
      return (
        <View style={[styles.profileImage, styles.defaultImageContainer]}>
          <MaterialIcons name="person" size={60} color="#CCCCCC" />
        </View>
      );
    }

    try {
      let imageUrl = user.imageUrl.replace('http://localhost:3000', API_BASE_URL);
      console.log('URL de l\'image corrigée:', imageUrl);
      
      return (
        <Image
          source={{ uri: imageUrl }}
          style={styles.profileImage}
          resizeMode="cover"
          onLoadStart={() => {
            console.log('Début du chargement de l\'image:', imageUrl);
            setImageError(false);
          }}
          onError={(e) => {
            console.error('Erreur de chargement de l\'image:', imageUrl);
            setImageError(true);
          }}
        />
      );
    } catch (error) {
      console.error("Erreur lors de l'affichage de l'image:", error);
      return (
        <View style={[styles.profileImage, styles.defaultImageContainer]}>
          <MaterialIcons name="person" size={60} color="#CCCCCC" />
        </View>
      );
    }
  };

  if (user.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (user.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{user.error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498db" barStyle="dark-content" />
      
      {/* Background image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require("../../assets/logo.jpeg")}
          resizeMode="cover"
          style={styles.backgroundImage}
        />
      </View>

      {/* Profile Information */}
      <Animatable.View
        animation="fadeInUpBig"
        duration={1500}
        style={styles.profileContainer}
      >
        <View style={styles.imageContainer}>
          {renderProfileImage()}
          {!imageError && user?.imageUrl && (
            <ActivityIndicator 
              style={styles.imageLoader}
              size="small" 
              color="#3498db"
            />
          )}
        </View>
        <Text style={styles.username}>{user.username || 'Username'}</Text>
        <Text style={styles.fullName}>
          {user.nom && user.prenom ? `${user.nom} ${user.prenom}` : 'Nom complet'}
        </Text>
        <Text style={styles.email}>{user.email || 'Email'}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.pointTotal}</Text>
            <Text style={styles.statLabel}>Points Total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.pointMensuel}</Text>
            <Text style={styles.statLabel}>Points Mensuels</Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>  navigation.navigate("EditProfile")}
        >
          <Text style={styles.buttonText}>Editer le Profile</Text>
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3498db", // Changement de la couleur de fond en bleu
  },
  backgroundContainer: {
    width: "100%",
    height: 250,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    opacity: 0.3, // Réduit l'opacité pour un effet de brillance atténuée
    filter: "brightness(50%)", // Applique un filtre de réduction de la brillance
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 160, // Décale le contenu sous l'image de fond
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -10 },
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 15,
    borderRadius: 60,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  defaultImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  fullName: {
    fontSize: 18,
    color: "#777",
    marginVertical: 5,
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginVertical: 10,
  },
  stat: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6347",
  },
  statLabel: {
    fontSize: 14,
    color: "#777",
  },
  editButton: {
    backgroundColor: "#4c669f",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  }
});
