import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUser, UserDetails, updateUser } from "../api/user";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";  


const router = useRouter();

export default function Settings() {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
        setName(data.name || "");
        setAge(data.age?.toString() || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
  if (!user) return;
  try {
    const updatedUser = { ...user, name, age: Number(age) };
    
    // Call API to update user details
    await updateUser(updatedUser);

    // Update local state
    setUser(updatedUser);
    setIsEditing(false);
  } catch (err) {
    console.error("Failed to update user:", err);
    alert("Failed to update user details.");
  }
};


  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setAge(user.age?.toString() || "");
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
  try {
    await SecureStore.deleteItemAsync("jwt"); // remove your JWT
    // Optionally, navigate to login
    router.replace("../(auth)/signin");
  } catch (err) {
    console.error("Error logging out:", err);
  }
};
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profileCircle} />

      {user ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.inputEditable]}
                value={name}
                onChangeText={setName}
              />
            ) : (
              <Text style={styles.value}>{user.name}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.inputEditable]}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{user.age || "N/A"}</Text>
            )}
          </View>

          {isEditing ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEdit}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}

          {/* Log Out Button */}
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.label}>Not logged in</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    alignSelf: "center",
  },
  field: { marginBottom: 18 },
  label: { fontSize: 16, color: "#cbd5e1", marginBottom: 6 },
  value: { fontSize: 16, color: "#f1f5f9", paddingVertical: 8 },
  input: {
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 8,
  },
  inputEditable: {
    borderWidth: 1,
    borderColor: "#334155",
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1e293b",
    alignSelf: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  editButton: {
    backgroundColor: "#2563eb",
    alignSelf: "center",
    marginTop: 30,
  },
  saveButton: { backgroundColor: "#16a34a" },
  cancelButton: { backgroundColor: "#dc2626" },
  logoutButton: {
    backgroundColor: "#475569",
    alignSelf: "center",
    marginTop: 20,
    minWidth: 120,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
