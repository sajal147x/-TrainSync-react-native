import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const NewPreMade: React.FC = () => {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("");

  const handleAddExercise = () => {
    const trimmedName = workoutName.trim();
    if (trimmedName.length === 0) {
      return; // Don't navigate if name is empty
    }
    router.push({
      pathname: "/PreMadeWorkouts/exercise-selection",
      params: { workoutName: trimmedName },
    });
  };

  const isNameValid = workoutName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Pre-Made Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Workout Name *</Text>
          <TextInput
            style={[
              styles.input,
              !isNameValid && workoutName.length > 0 && styles.inputError,
            ]}
            placeholder="Enter workout name"
            placeholderTextColor="#6b7280"
            value={workoutName}
            onChangeText={setWorkoutName}
            autoCapitalize="words"
          />
          {!isNameValid && workoutName.length > 0 && (
            <Text style={styles.errorText}>Workout name is required</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.buttonContainer,
            !isNameValid && styles.buttonDisabled,
          ]}
          onPress={handleAddExercise}
          activeOpacity={0.8}
          disabled={!isNameValid}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            <LinearGradient
              colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientOverlay}
            >
              <View style={styles.buttonInner}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Add Exercise</Text>
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
  headerTitle: {
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
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContainer: {
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
  blurView: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientOverlay: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default NewPreMade;

