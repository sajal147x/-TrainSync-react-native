import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getCurrentUser, UserDetails, updateUser } from "../api/user";
import storage from "../api/storage";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { logout, deleteAccount } from "../api/auth/auth";  

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
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

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
    // Get tokens before deleting them
    const refreshToken = await storage.getItemAsync("refreshToken");
    const pushNotificationToken = await storage.getItemAsync("pushToken");
    
    // Call logout API
    if (refreshToken) {
      try {
        await logout(refreshToken, pushNotificationToken);
      } catch (err) {
        console.error("Error calling logout API:", err);
        // Continue with local logout even if API call fails
      }
    }
    
    // Clear local storage
    await storage.deleteItemAsync("jwt"); // remove your JWT
    await storage.deleteItemAsync("refreshToken"); // remove your refresh token
    await storage.deleteItemAsync("pushToken"); // remove push token
    
    // Navigate to login
    router.replace("../(auth)/signin");
  } catch (err) {
    console.error("Error logging out:", err);
  }
};

  const handleDeleteAccountPress = () => setShowDeleteAccountDialog(true);

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await deleteAccount();
      setShowDeleteAccountDialog(false);
      if (res.status >= 200 && res.status < 300) {
        await handleLogout();
      } else {
        Alert.alert("Error", res.data?.message || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setShowDeleteAccountDialog(false);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setDeletingAccount(false);
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
  const displayImage = selectedImage 
    ? selectedImage 
    : user?.profilePictureUrl || null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        {!isEditing && user && (
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={24} color="#3b82f6" />
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
                source={{ uri: displayImage }}
                style={styles.profileImage}
                contentFit="cover"
                cachePolicy="disk"
              />
            ) : null}
          </View>
          {isEditing && (
            <View style={styles.editPictureIconOverlay}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {user ? (
        <>
          <View style={styles.fieldsContainer}>
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
              <Text style={styles.label}>Username</Text>
              <Text style={styles.value}>{user.username}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email || "N/A"}</Text>
            </View>

            <View style={styles.fieldLast}>
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

          {/* Admin Button - Only visible for ADMIN users */}
          {user?.userType === "ADMIN" && (
            <View style={styles.adminButtonsRow}>
              <TouchableOpacity
                style={styles.adminButtonContainer}
                onPress={() => router.push("../admin/configureExerciseLibrary")}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} tint="dark" style={styles.blurView}>
                  <LinearGradient
                    colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                  >
                    <View style={styles.buttonInner}>
                      <Text style={styles.adminButtonText}>Configure Library</Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adminButtonContainer}
                onPress={() => router.push("../admin/EditExerciseLibrary")}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} tint="dark" style={styles.blurView}>
                  <LinearGradient
                    colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                  >
                    <View style={styles.buttonInner}>
                      <Text style={styles.adminButtonText}>Edit Exercise</Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            </View>
          )}

          {/* Log Out and Delete Account Buttons */}
          <View style={styles.logoutRow}>
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
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccountPress}
              disabled={deletingAccount}
              activeOpacity={0.8}
            >
              <BlurView intensity={80} tint="dark" style={styles.blurView}>
                <LinearGradient
                  colors={["rgba(220, 38, 38, 0.4)", "rgba(185, 28, 28, 0.3)", "rgba(220, 38, 38, 0.4)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientOverlay}
                >
                  <View style={styles.buttonInner}>
                    {deletingAccount ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
                    )}
                  </View>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.label}>Not logged in</Text>
      )}

      {/* Delete Account Confirmation Dialog */}
      <Modal
        visible={showDeleteAccountDialog}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteAccountDialog(false)}
      >
        <View style={styles.deleteDialogOverlay}>
          <TouchableOpacity
            style={styles.deleteDialogBackdrop}
            activeOpacity={1}
            onPress={() => setShowDeleteAccountDialog(false)}
          />
          <View style={styles.deleteDialogContent}>
            <Text style={styles.deleteDialogTitle}>Delete Account</Text>
            <Text style={styles.deleteDialogMessage}>
              Are you sure you want to delete your account?
            </Text>
            <View style={styles.deleteDialogButtons}>
              <TouchableOpacity
                style={styles.deleteDialogCancelButton}
                onPress={() => setShowDeleteAccountDialog(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteDialogCancelText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteDialogConfirmButton}
                onPress={confirmDeleteAccount}
                activeOpacity={0.8}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteDialogConfirmText}>Yes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  fieldsContainer: {
    padding: 12,
    marginBottom: 24,
  },
  field: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.3)",
  },
  fieldLast: {
    paddingVertical: 12,
    paddingHorizontal: 4,
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
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  liquidGlassButtonLogout: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 120,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.5)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  deleteAccountButton: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 120,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.6)",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  deleteAccountButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  adminButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  adminButtonContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  adminButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  deleteDialogOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  deleteDialogBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  deleteDialogContent: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  deleteDialogTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  deleteDialogMessage: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  deleteDialogButtons: {
    flexDirection: "row",
    gap: 12,
  },
  deleteDialogCancelButton: {
    flex: 1,
    backgroundColor: "rgba(156, 163, 175, 0.2)",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(156, 163, 175, 0.3)",
  },
  deleteDialogCancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteDialogConfirmButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  deleteDialogConfirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
