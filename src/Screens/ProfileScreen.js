import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
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

export default function ProfileScreen({navigation}) {

  return (
    
    <SafeAreaView style={styles.safeArea}>
      {/* Status Bar Customization */}
      <StatusBar backgroundColor="#f2f2f2" barStyle="dark-content" />
 
      {/* Background Image */}
      <View style={styles.backgroundImageContainer}>
        <Image
          source={require("../../assets/logo3.jpeg")} // Ensure the correct path for your image
          resizeMode="cover"
          style={styles.backgroundImage}
        />
      </View>
        
      {/* Profile Image and Information */}
      <Animatable.View
        animation="fadeInUpBig"
        duration={1500}
        style={styles.profileInfoContainer}
      >
        <Image
          source={require("../../assets/logo1.jpeg")} // Use the same or a different image for the profile picture
          resizeMode="contain"
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Youssef kassimi</Text>
        <Text style={styles.profileEmail}>YoussefKassimi@example.com</Text>

        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={24} color="#FF6347" />
          <Text style={styles.locationText}>Rabat, Morocco</Text>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>122</Text>
              <Text style={styles.statLabel}>Point Total</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>20</Text>
              <Text style={styles.statLabel}>Point Mensuel</Text>
            </View>
        </View>

       {/* Edit Profile Button */}
       <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backgroundImageContainer: {
    width: "100%",
    height: 228,
  },
  backgroundImage: {
    height: "100%",
    width: "100%",
  },
  profileInfoContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: -90,
  },
  profileImage: {
    height: 155,
    width: 155,
    borderRadius: 77.5,
    borderWidth: 2,
    borderColor: "#FF6347",
    marginBottom: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
    color: "#444",
  },
  statsContainer: {
    flexDirection: "row",
    marginVertical: 16,
  },
  stat: {
    alignItems: "center",
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6347",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    backgroundColor: "#4c669f",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
