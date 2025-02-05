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
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../Redux/actions/userActions";

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.searchResults);
  console.log("---------------------------------> ", user);
  useEffect(() => {
    dispatch(getUserProfile());
    console.log("Fetching user profile.............> ", user);
  }, [dispatch]);

  if (user.loading) {
    return <Text>Loading...</Text>;
  }
  if (user.error) {
    return <Text>{user.error}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498db" barStyle="dark-content" />
      
      {/* Background image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require("../../assets/logo.jpeg")} // Assurez-vous que l'image est dans le bon dossier
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
      <Image
          source={user.profileImage ? { uri: user.profileImage } : require("../../assets/unknownProfile.jpg")}
          resizeMode="contain"
          style={styles.profileImage}
      />


        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.fullName}>{user.nom} {user.prenom}</Text>
        <Text style={styles.email}>{user.email}</Text>

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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FF6347",
    marginBottom: 20,
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
});
