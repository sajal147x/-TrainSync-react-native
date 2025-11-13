import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ExerciseDto } from "../api/exercises";
import ExerciseSelectionModal from "../components/ExerciseSelectionModal";

const NewWorkout: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectExercise = (exercise: ExerciseDto) => {
    console.log("Selected exercise:", exercise);
    // TODO: Add exercise to workout
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
        <Text style={styles.title}>New Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.addExerciseButton}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
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
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </View>

      <ExerciseSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectExercise={handleSelectExercise}
      />
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
  addExerciseButton: {
    borderRadius: 12,
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
  addExerciseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default NewWorkout;

