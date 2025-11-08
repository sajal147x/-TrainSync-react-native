import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { getCurrentUser, UserDetails, updateUser } from "../api/user";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";  

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // URI for display
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null); // Base64 for upload
  const [uploading, setUploading] = useState(false);

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

  const handlePickImage = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "We need access to your photos to upload a profile picture.");
        return;
      }

      // Launch image picker with base64 option
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true, // Get base64 directly
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri); // URI for display
        if (result.assets[0].base64) {
          setSelectedImageBase64(result.assets[0].base64); // Base64 for upload
        }
      }
    } catch (err) {
      console.error("Error picking image:", err);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const updatedUser = { ...user, name, age: Number(age) };
      
      // Call API to update user details (including profile picture if selected)
      const result = await updateUser(updatedUser, selectedImageBase64);

      // Update local state
      setUser(result);
      setSelectedImage(null);
      setSelectedImageBase64(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update user:", err);
      Alert.alert("Error", "Failed to update user details.");
    } finally {
      setUploading(false);
    }
  };


  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setAge(user.age?.toString() || "");
    }
    setSelectedImage(null);
    setSelectedImageBase64(null);
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

  // Determine which image to display
  const displayImage = selectedImage || user?.profilePictureUrl || null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profilePictureContainer}>
        <View style={styles.profileCircle}>
          {displayImage ? (
            <Image
              source={{ uri: displayImage }}
              style={styles.profileImage}
              contentFit="cover"
            />
          ) : null}
        </View>
        {isEditing && (
          <TouchableOpacity
            style={styles.editPictureButton}
            onPress={handlePickImage}
          >
            <Text style={styles.editPictureButtonText}>
              {user?.profilePictureUrl ? "Change" : "Add Photo"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={uploading}
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
  field: {
    paddingVertical: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  label: { fontSize: 16, color: "#cbd5e1", marginBottom: 6, fontWeight: "700" },
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
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1e293b",
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#334155",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  editPictureButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  editPictureButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
