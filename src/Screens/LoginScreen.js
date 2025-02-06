import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useDispatch, useSelector } from "react-redux";
import { login, setLoginForm } from "../Redux/actions/authActions";
import Toast from "react-native-toast-message";

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loginForm, loading, error } = useSelector((state) => state.auth);

  const handleInputChange = (field, value) => {
    dispatch(setLoginForm(field, value));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email?.trim())) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Veuillez entrer une adresse email valide",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    if (!loginForm.email?.trim() || !loginForm.password?.trim()) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Veuillez remplir tous les champs",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    if (loginForm.password.trim().length < 6) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Le mot de passe doit contenir au moins 6 caractères",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const credentials = {
        email: loginForm.email.trim(),
        password: loginForm.password.trim(),
      };

      console.log(credentials);

      const result = await dispatch(login(credentials));

      if (result && result.success) {
        navigation.replace("MainApp");
        Toast.show({
          type: "success",
          text1: "Succès",
          text2: result.message || "Connexion réussie",
          position: "top",
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2:
            result?.error || "Une erreur est survenue lors de la connexion",
          position: "top",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue lors de la connexion",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Animatable.View animation="fadeInUpBig" style={styles.footer}>
          <Text style={styles.title}>Connexion</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={loginForm.email}
              onChangeText={(value) => handleInputChange("email", value)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="Mot de passe"
              style={styles.input}
              value={loginForm.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </Animatable.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 250,
  },
  title: {
    color: "#333",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
    marginBottom: 25,
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: "#333",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#4c669f",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
  },
  registerText: {
    color: "#666",
  },
  registerLink: {
    color: "#4c669f",
    fontWeight: "bold",
  },
  forgotPasswordButton: {
    marginTop: 10,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#4c669f",
    fontSize: 14,
  },
});

export default LoginScreen;
