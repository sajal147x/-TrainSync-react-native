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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const response = await signIn(email, password);
       // after successful signup/signin
    await storage.setItemAsync("jwt", response.data.access_token);

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Sign in failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Welcome back! Enter your credentials to continue.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9AA4B2"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
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
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// reuse the same styles as signup
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  inner: { flex: 1, justifyContent: "center", padding: 24 },
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
});
