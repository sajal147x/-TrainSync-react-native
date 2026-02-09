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
import { signUp } from "../api/auth/auth";
import storage from "../api/storage";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");  // new field
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");    // new field
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleAgeChange = (text: string) => {
    // Only allow numeric input
    const numericValue = text.replace(/[^0-9]/g, "");
    setAge(numericValue);
    setErrorMessage(""); // Clear error when user types
  };

  const handleSignUp = async () => {
    setErrorMessage(""); // Clear previous errors
    try {
      const ageNumber = age ? (parseInt(age, 10) || undefined) : undefined;
      const response = await signUp(username, password, name, email, ageNumber);
      
      // Check response immediately - if 401 with "User Already Exists", show error and return
      if (response.status === 401 && response.data === "User Already Exists") {
        setErrorMessage("User Already Exists");
        return;
      }
      
      // If not successful, handle other error cases
      if (response.status !== 200 && response.status !== 201) {
        const errorMsg = response.data?.message || response.data || "Sign up failed";
        setErrorMessage(errorMsg);
        return;
      }
      
      // Store JWT token and refresh token in secure store only if successful
      await storage.setItemAsync("jwt", response.data.accessToken);
      await storage.setItemAsync("refreshToken", response.data.refreshToken);

      alert(`Signup successful for ${username}`);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error(error);
      // Handle network errors or other unexpected errors
      const errorMsg = error.response?.data?.message || error.response?.data || "Sign up failed";
      setErrorMessage(errorMsg);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join Train Sync — track progress & train smarter.
        </Text>

        <View style={styles.form}>
          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrorMessage(""); // Clear error when user types
            }}
            placeholder="Your name"
            placeholderTextColor="#9AA4B2"
            style={styles.input}
          />

          {/* Email */}
          <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage(""); // Clear error when user types
            }}
            placeholder="Your email"
            placeholderTextColor="#9AA4B2"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          {/* Age */}
          <Text style={[styles.label, { marginTop: 16 }]}>Age (optional)</Text>
          <TextInput
            value={age}
            onChangeText={handleAgeChange}
            placeholder="Your age"
            placeholderTextColor="#9AA4B2"
            style={styles.input}
            keyboardType="number-pad"
          />

          {/* Username */}
          <Text style={[styles.label, { marginTop: 16 }]}>Username</Text>
          <TextInput
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrorMessage(""); // Clear error when user types
            }}
            placeholder="Your username"
            placeholderTextColor="#9AA4B2"
            style={styles.input}
            autoCapitalize="none"
            textContentType="username"
          />

          {/* Password */}
          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage(""); // Clear error when user types
              }}
              placeholder="Enter a password"
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

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignUp}
          >
            <Text style={styles.primaryText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => router.push("/(auth)/resetPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/signin" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}> Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: "#60a5fa",
    fontSize: 14,
    fontWeight: "600",
  },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#9AA4B2" },
  signInLink: { color: "#60a5fa", fontWeight: "600" },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7f1d1d",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 14,
    flex: 1,
  },
});

