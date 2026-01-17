import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { signIn } from "../api/auth"; // your API call
import storage from "../api/storage";


export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleSignIn = async () => {
    setErrorMessage(""); // Clear any previous error
    try {
      const response = await signIn(username, password);
      // Check if response is unauthorized (401)
      if (response.status === 401) {
        // Backend returns error messages directly in response.data as strings
        // "User Not Found" or "Invalid credentials"
        const errorMsg = typeof response.data === "string" 
          ? response.data 
          : "Sign in failed";
        setErrorMessage(errorMsg);
        return;
      }
      
      // Store JWT token and refresh token in SecureStore (via storage utility)
      // Response format: { userId, username, accessToken, refreshToken }
      await storage.setItemAsync("jwt", response.data.accessToken);
      await storage.setItemAsync("refreshToken", response.data.refreshToken);

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Sign in failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.inner}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Welcome back! Enter your credentials to continue.
        </Text>

        <View style={styles.form}>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrorMessage(""); // Clear error when user starts typing
            }}
            placeholder="Enter your username"
            placeholderTextColor="#9AA4B2"
            style={styles.input}
            autoCapitalize="none"
            textContentType="username"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage(""); // Clear error when user starts typing
              }}
              placeholder="Enter your password"
              placeholderTextColor="#9AA4B2"
              secureTextEntry={!passwordVisible}
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              autoCapitalize="none"
              textContentType="password"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setPasswordVisible((v) => !v)}
            >
              <Ionicons
                name={passwordVisible ? "eye" : "eye-off"}
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignIn}
          >
            <Text style={styles.primaryText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}> Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <Text style={styles.noEmailText}>No Email Required</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// reuse the same styles as signup
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  inner: { flex: 1, justifyContent: "center", padding: 24 },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  title: { fontSize: 34, fontWeight: "800", color: "#fff", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#9AA4B2", marginBottom: 22 },
  form: { width: "100%" },
  label: { color: "#cbd5e1", marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: "#0f1724",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#131720",
    fontSize: 15,
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeButton: { padding: 8 },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#9AA4B2" },
  signInLink: { color: "#60a5fa", fontWeight: "600" },
  noEmailText: {
    color: "#9AA4B2",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});
