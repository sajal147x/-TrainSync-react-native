import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function Index() {
  return (
    <LinearGradient colors={["#0d1117", "#1a1f29"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Train Sync</Text>
        <Text style={styles.subtitle}>
          Track progress. Stay consistent. Train smarter.
        </Text>

        <View style={styles.buttonContainer}>
          {/* Sign In */}
          <Link href="/(auth)/signin" asChild>
            <TouchableOpacity style={styles.signInButton}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </Link>

          {/* Sign Up */}
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.signUpButton}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>

          {/* Continue with Google */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log("TODO: Google OAuth via Java microservice")}
          >
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 50,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  signInButton: {
    backgroundColor: "#2563eb",
    width: "90%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2563eb",
    width: "90%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 25,
  },
  signUpText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#db4437",
    width: "90%",
    paddingVertical: 14,
    borderRadius: 12,
  },
  googleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});