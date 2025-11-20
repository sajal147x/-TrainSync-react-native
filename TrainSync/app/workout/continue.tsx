import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getWorkout, Workout } from "../api/workout";
import EditExerciseModal from "../components/EditExerciseModal";

const ContinueWorkout: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; exerciseId: string; index: number; sets: any[]; preFilledFlag?: string; preFilledDate?: string; preFilledWorkoutName?: string } | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) {
        console.error("No workoutId provided");
        setLoading(false);
        return;
      }

      try {
        const data = await getWorkout(workoutId);
        setWorkout(data);
      } catch (error) {
        console.error("Error fetching workout:", error);
        // Still set loading to false so UI doesn't get stuck
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Loading...</Text>
        <View style={styles.placeholder} />
      </View>
        <View style={[styles.content, styles.centerContent]}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{workout?.workoutName || "Workout"}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
            {workout?.exercises && workout.exercises.length > 0 ? (
              workout.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedExercise({ 
                        name: exercise.name, 
                        exerciseId: exercise.id, 
                        index,
                        sets: exercise.sets || [],
                        preFilledFlag: exercise.preFilledFlag,
                        preFilledDate: exercise.preFilledDate,
                        preFilledWorkoutName: exercise.preFilledWorkoutName,
                      });
                      setEditModalVisible(true);
                    }}
                    style={styles.editButton}
                  >
                    <Ionicons name="create-outline" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No exercises added yet</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: "/workout/exercise-selection",
            params: {
              workoutId,
            }
          })}
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
                <Text style={styles.buttonText}>Add Another Exercise</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.push("/(tabs)/workout")}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <EditExerciseModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedExercise(null);
        }}
        exerciseName={selectedExercise?.name || ""}
        exerciseId={selectedExercise?.exerciseId || ""}
        existingSets={selectedExercise?.sets || []}
        preFilledFlag={selectedExercise?.preFilledFlag}
        preFilledDate={selectedExercise?.preFilledDate}
        preFilledWorkoutName={selectedExercise?.preFilledWorkoutName}
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
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  exercisesContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  exercisesList: {
    flex: 1,
  },
  exerciseItem: {
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseNumberText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "700",
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  editButton: {
    padding: 4,
    marginRight: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
  continueButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
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
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  doneButton: {
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    alignItems: "center",
  },
  doneButtonText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ContinueWorkout;

