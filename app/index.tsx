import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import storage from "./api/storage";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in (has stored token)
    const checkAuthStatus = async () => {
      try {
        const token = await storage.getItemAsync("jwt");
        if (token) {
          // User is logged in, redirect to home
          router.replace("/(tabs)/home");
        } else {
          // No token found, show sign-in options
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <LinearGradient colors={["#0d1117", "#1a1f29"]} style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </LinearGradient>
    );
  }

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
          <Text style={styles.noEmailText}>No Email Required</Text>
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
  noEmailText: {
    color: "#9AA4B2",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});