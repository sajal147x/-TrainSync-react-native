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
import { useRouter } from "expo-router";
import { resetPassword } from "../api/auth/resetPassword";

export default function ResetPassword() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!emailOrUsername.trim()) {
      setErrorMessage("Please enter your email or username");
      setSuccessMessage("");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await resetPassword(emailOrUsername.trim());
      
      if (response.status === 200 && response.data) {
        setSuccessMessage(response.data.message);
        setErrorMessage("");
      } else {
        // Handle error response
        const errorMsg = response.data?.message || "Failed to reset password. Please try again.";
        setErrorMessage(errorMsg);
        setSuccessMessage("");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "An error occurred. Please try again.";
      setErrorMessage(errorMsg);
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
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
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email or username to reset your password.
        </Text>

        <View style={styles.form}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Enter Email/Username</Text>
          <TextInput
            value={emailOrUsername}
            onChangeText={(text) => {
              setEmailOrUsername(text);
              setErrorMessage(""); // Clear error when user types
              setSuccessMessage(""); // Clear success message when user types
            }}
            placeholder="Enter your email or username"
            placeholderTextColor="#9AA4B2"
            style={styles.input}
            autoCapitalize="none"
            textContentType="username"
          />

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.primaryText}>
              {isLoading ? "Submitting..." : "Submit"}
            </Text>
          </TouchableOpacity>
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
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7f1d1d",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 14,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#064e3b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: "#6ee7b7",
    fontSize: 14,
    flex: 1,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
});
