import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { createPreMadeWorkoutFromExistingWorkout } from "../api/PreMadeWorkout";

const ConvertWorkoutToPreMade: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  const workoutName = params.workoutName as string;
  const [preMadeWorkoutName, setPreMadeWorkoutName] = useState(workoutName || "");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!workoutId) {
      Alert.alert("Error", "Workout ID is missing");
      return;
    }

    if (!preMadeWorkoutName.trim()) {
      Alert.alert("Error", "Please enter a pre-made workout name");
      return;
    }

    setIsCreating(true);
    try {
      const preMadeWorkoutId = await createPreMadeWorkoutFromExistingWorkout({
        workoutId: workoutId,
        name: preMadeWorkoutName.trim(),
      });
      
      // Navigate to the continue page with the pre-made workout ID
      router.push({
        pathname: "/PreMadeWorkouts/continue",
        params: {
          preMadeWorkoutId: preMadeWorkoutId,
        },
      });
    } catch (error: any) {
      console.error("Error creating pre-made workout:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create pre-made workout. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Convert to Pre Made Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Pre-Made Workout Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Pre-Made Workout Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pre-made workout name"
            placeholderTextColor="#6b7280"
            value={preMadeWorkoutName}
            onChangeText={setPreMadeWorkoutName}
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, isCreating && styles.createButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleCreate}
          disabled={isCreating}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            <LinearGradient
              colors={[
                "rgba(59, 130, 246, 0.2)",
                "rgba(59, 130, 246, 0.1)",
                "rgba(59, 130, 246, 0.2)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientOverlay}
            >
              <View style={styles.buttonInner}>
                {isCreating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                )}
                <Text style={styles.createButtonText}>
                  {isCreating ? "Creating..." : "Create"}
                </Text>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  createButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: "auto",
    marginBottom: 32,
  },
  blurView: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientOverlay: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
});

export default ConvertWorkoutToPreMade;

