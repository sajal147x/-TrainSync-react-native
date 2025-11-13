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
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getCurrentUser, UserDetails, updateUser } from "../api/user";
import * as SecureStore from "expo-secure-store";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";  

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

  // Fetch user data on mount
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

  // Refetch user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refetchUser = async () => {
        try {
          const data = await getCurrentUser();
          setUser(data);
          setName(data.name || "");
          setAge(data.age?.toString() || "");
        } catch (err) {
          console.error("Error refetching user:", err);
        }
      };
      refetchUser();
    }, [])
  );

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
        mediaTypes: 'images',
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
      
      console.log("User updated successfully:", result);
      console.log("New profile picture URL:", result.profilePictureUrl);

      // Update local state
      setUser(result);
      setSelectedImage(null);
      setSelectedImageBase64(null);
      setIsEditing(false);
      
      Alert.alert("Success", "Profile updated successfully!");
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

  // Determine which image to display with cache-busting query parameter
  const displayImage = selectedImage 
    ? selectedImage 
    : user?.profilePictureUrl 
      ? `${user.profilePictureUrl}?t=${Date.now()}` 
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        {!isEditing && user && (
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={24} color="#3b82f6" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profilePictureContainer}>
        <TouchableOpacity
          onPress={isEditing ? handlePickImage : undefined}
          disabled={!isEditing}
          activeOpacity={isEditing ? 0.7 : 1}
          style={styles.profileTouchable}
        >
          <View style={styles.profileCircle}>
            {displayImage ? (
              <Image
                key={displayImage} // Force re-render when URL changes
                source={{ uri: displayImage }}
                style={styles.profileImage}
                contentFit="cover"
                cachePolicy="none" // Disable caching to always fetch fresh image
              />
            ) : null}
          </View>
          {isEditing && (
            <View style={styles.editPictureIconOverlay}>
              <Ionicons name="pencil" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
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

          {isEditing && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.liquidGlassButton}
                onPress={handleCancel}
                disabled={uploading}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} tint="dark" style={styles.blurView}>
                  <LinearGradient
                    colors={["rgba(59, 130, 246, 0.15)", "rgba(59, 130, 246, 0.08)", "rgba(59, 130, 246, 0.15)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                  >
                    <View style={styles.buttonInner}>
                      <Text style={styles.liquidGlassButtonText}>Cancel</Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.liquidGlassButton}
                onPress={handleSave}
                disabled={uploading}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} tint="dark" style={styles.blurView}>
                  <LinearGradient
                    colors={["rgba(59, 130, 246, 0.15)", "rgba(59, 130, 246, 0.08)", "rgba(59, 130, 246, 0.15)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                  >
                    <View style={styles.buttonInner}>
                      {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.liquidGlassButtonText}>Save</Text>
                      )}
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            </View>
          )}

          {/* Log Out Button */}
          <TouchableOpacity
            style={styles.liquidGlassButtonLogout}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <BlurView intensity={80} tint="dark" style={styles.blurView}>
              <LinearGradient
                colors={["rgba(59, 130, 246, 0.25)", "rgba(59, 130, 246, 0.15)", "rgba(59, 130, 246, 0.25)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientOverlay}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.liquidGlassButtonText}>Log Out</Text>
                </View>
              </LinearGradient>
            </BlurView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  editIconButton: {
    padding: 8,
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
  profileTouchable: {
    position: "relative",
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
  editPictureIconOverlay: {
    position: "absolute",
    bottom: 12,
    right: -4,
    backgroundColor: "#3b82f6",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0d1117",
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
  saveButton: { backgroundColor: "#16a34a" },
  cancelButton: { backgroundColor: "#dc2626" },
  logoutButton: {
    backgroundColor: "#475569",
    alignSelf: "center",
    marginTop: 20,
    minWidth: 120,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  liquidGlassButton: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 100,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  blurView: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientOverlay: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  liquidGlassButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  liquidGlassButtonLogout: {
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 20,
    minWidth: 120,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.5)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
});
