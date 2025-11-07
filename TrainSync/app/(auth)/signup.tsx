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
import { Link } from "expo-router";
import { signUp } from "../api/auth";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";


export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const router = useRouter(); // for navigation

const handleSignUp = async () => {
  try {
    const response = await signUp(email, password);

    // store JWT token securely
    await SecureStore.setItemAsync("jwt", JSON.stringify(response.data));
    alert(`Signup successful for ${email}`);
    // navigate to home or main app screen
    router.replace("/(tabs)/home"); 
  } catch (error: any) {
    console.error(error);
    alert(error.response?.data?.message || "Sign up failed");
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join Train Sync — track progress & train smarter.
        </Text>

        <View style={styles.form}>
          {/* Email */}
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

          {/* Password */}
          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
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

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignUp}
          >
            <Text style={styles.primaryText}>Sign Up</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.orRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          {/* Continue with Google */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log("TODO: Continue with Google")}
          >
            <Ionicons name="logo-google" size={18} color="#fff" />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Link to Sign In */}
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
  orRow: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: "#0f1724" },
  orText: { marginHorizontal: 12, color: "#9AA4B2" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "transparent",
  },
  googleText: { marginLeft: 8, fontWeight: "600", color: "#e5e7eb" },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#9AA4B2" },
  signInLink: { color: "#60a5fa", fontWeight: "600" },
});

