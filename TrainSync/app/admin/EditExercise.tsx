import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  editExercise,
  ExerciseDto,
} from "../api/exercises";

export default function EditExercise() {
  const router = useRouter();
  const { exerciseData } = useLocalSearchParams<{ exerciseData: string }>();
  const [exercise, setExercise] = useState<ExerciseDto | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingExercise, setIsSavingExercise] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // URI for display
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null); // Base64 for upload
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!exerciseData) {
        setSaveFeedback({
          type: "error",
          message: "Exercise data is missing.",
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Parse exercise data from route params
        const parsedExercise: ExerciseDto = JSON.parse(exerciseData);
        setExercise(parsedExercise);
        setExerciseName(parsedExercise.name);
        
        // Set image if available
        if (parsedExercise.exercisePictureUrl) {
          setSelectedImage(parsedExercise.exercisePictureUrl);
        }
      } catch (error) {
        console.error("Failed to parse exercise data:", error);
        setSaveFeedback({
          type: "error",
          message: "Failed to load exercise data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseData]);

  const getEquipmentDisplay = () => {
    if (!exercise) return "No equipment";
    return exercise.equipmentTag?.name || "No equipment";
  };

  const getPrimaryMusclesDisplay = () => {
    if (!exercise) return "None";
    const primaryMuscles = exercise.muscleTags
      .filter((tag) => tag.level === "PRIMARY")
      .map((tag) => tag.name);
    return primaryMuscles.length > 0 ? primaryMuscles.join(", ") : "None";
  };

  const getSecondaryMusclesDisplay = () => {
    if (!exercise) return "None";
    const secondaryMuscles = exercise.muscleTags
      .filter((tag) => tag.level === "SECONDARY")
      .map((tag) => tag.name);
    return secondaryMuscles.length > 0 ? secondaryMuscles.join(", ") : "None";
  };

  const handlePickImage = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "We need access to your photos to upload an exercise picture.");
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
    if (!exercise || !exercise.id) {
      setSaveFeedback({
        type: "error",
        message: "Exercise ID is missing.",
      });
      return;
    }

    if (!exerciseName.trim()) {
      setSaveFeedback({
        type: "error",
        message: "Exercise name cannot be empty.",
      });
      return;
    }

    setIsSavingExercise(true);
    setSaveFeedback(null);

    try {
      // Get equipment ID from exercise
      const equipmentTagId = exercise.equipmentTag?.id || "";

      // Send exerciseId, equipmentTagId, and pictureBase64 to edit-exercise endpoint
      const updatedExercise = await editExercise({
        exerciseId: exercise.id,
        equipmentTagId: equipmentTagId,
        pictureBase64: selectedImageBase64 || "",
      });

      // Update local state with updated exercise (including new picture URL)
      setExercise(updatedExercise);
      if (updatedExercise.exercisePictureUrl) {
        setSelectedImage(updatedExercise.exercisePictureUrl);
      }
      setSelectedImageBase64(null); // Clear base64 after successful upload

      setSaveFeedback({
        type: "success",
        message: "Exercise updated successfully.",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Failed to update exercise:", error);
      setSaveFeedback({
        type: "error",
        message: "Unable to update exercise. Please try again.",
      });
    } finally {
      setIsSavingExercise(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Exercise</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Exercise</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Exercise Name</Text>
          <View style={styles.nameDisplay}>
            <Text style={styles.nameText}>{exerciseName}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Equipment</Text>
          <View style={styles.readOnlyDisplay}>
            <Text style={styles.readOnlyText}>{getEquipmentDisplay()}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Primary Muscles</Text>
          <View style={styles.readOnlyDisplay}>
            <Text style={styles.readOnlyText}>{getPrimaryMusclesDisplay()}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Secondary Muscles</Text>
          <View style={styles.readOnlyDisplay}>
            <Text style={styles.readOnlyText}>{getSecondaryMusclesDisplay()}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Exercise Picture</Text>
          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.exerciseImage}
                contentFit="cover"
              />
            </View>
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={uploadingImage}
          >
            <Ionicons name="camera" size={20} color="#3b82f6" style={styles.uploadIcon} />
            <Text style={styles.uploadButtonText}>
              {uploadingImage ? "Uploading..." : selectedImage ? "Change Picture" : "Upload Picture"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isSavingExercise && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSavingExercise}
        >
          <Text style={styles.saveButtonText}>
            {isSavingExercise ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
        {saveFeedback && (
          <Text
            style={[
              styles.statusText,
              saveFeedback.type === "error"
                ? styles.errorText
                : styles.successText,
            ]}
          >
            {saveFeedback.message}
          </Text>
        )}
      </View>
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
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#cbd5e1",
    marginBottom: 8,
    fontWeight: "700",
  },
  nameDisplay: {
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  nameText: {
    fontSize: 16,
    color: "#f1f5f9",
  },
  readOnlyDisplay: {
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    minHeight: 48,
    justifyContent: "center",
  },
  readOnlyText: {
    fontSize: 16,
    color: "#cbd5e1",
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
  },
  exerciseImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#1e293b",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderStyle: "dashed",
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  saveButtonContainer: {
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#f87171",
  },
  successText: {
    color: "#34d399",
  },
});

