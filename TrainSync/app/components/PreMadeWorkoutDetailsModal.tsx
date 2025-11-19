import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getPreMadeWorkout, PreMadeWorkout, startWorkoutUsingPreMade } from "../api/PreMadeWorkout";

interface PreMadeWorkoutDetailsModalProps {
  visible: boolean;
  preMadeWorkoutId: string | null;
  onClose: () => void;
}

const PreMadeWorkoutDetailsModal: React.FC<PreMadeWorkoutDetailsModalProps> = ({
  visible,
  preMadeWorkoutId,
  onClose,
}) => {
  const router = useRouter();
  const [workout, setWorkout] = useState<PreMadeWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startingWorkout, setStartingWorkout] = useState(false);

  const fetchWorkout = useCallback(async () => {
    if (!preMadeWorkoutId) {
      setError("No workout ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPreMadeWorkout(preMadeWorkoutId);
      setWorkout(data);
    } catch (err: any) {
      console.error("Error fetching pre-made workout:", err);
      setError(err.response?.data?.message || "Failed to load workout");
    } finally {
      setLoading(false);
    }
  }, [preMadeWorkoutId]);

  useEffect(() => {
    if (visible && preMadeWorkoutId) {
      fetchWorkout();
    } else {
      // Reset state when modal closes
      setWorkout(null);
      setError(null);
    }
  }, [visible, preMadeWorkoutId, fetchWorkout]);

  const handleStartWorkout = async () => {
    if (!preMadeWorkoutId) return;

    try {
      setStartingWorkout(true);
      setError(null);
      const workoutId = await startWorkoutUsingPreMade(preMadeWorkoutId);
      onClose();
      router.push({
        pathname: "/workout/continue",
        params: { workoutId },
      });
    } catch (err: any) {
      console.error("Error starting workout:", err);
      setError(err.response?.data?.message || "Failed to start workout");
    } finally {
      setStartingWorkout(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {workout?.name || "Pre-Made Workout"}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.contentSection}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.loadingText}>Loading workout...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={48} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchWorkout}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.exercisesContainer}>
                    <Text style={styles.sectionTitle}>Exercises</Text>
                    <ScrollView
                      style={styles.exercisesList}
                      showsVerticalScrollIndicator={false}
                    >
                      {workout?.exercises && workout.exercises.length > 0 ? (
                        workout.exercises.map((exercise, index) => (
                          <View key={exercise.id} style={styles.exerciseItem}>
                            <View style={styles.exerciseNumber}>
                              <Text style={styles.exerciseNumberText}>
                                {index + 1}
                              </Text>
                            </View>
                            <Text style={styles.exerciseName}>
                              {exercise.name}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.emptyState}>
                          <Text style={styles.emptyStateText}>
                            No exercises found
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>

                  {workout && (
                    <TouchableOpacity
                      style={styles.startWorkoutButton}
                      activeOpacity={0.8}
                      onPress={handleStartWorkout}
                      disabled={startingWorkout}
                    >
                      <BlurView
                        intensity={80}
                        tint="dark"
                        style={styles.blurView}
                      >
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
                            {startingWorkout ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Ionicons
                                name="play-circle-outline"
                                size={24}
                                color="#fff"
                              />
                            )}
                            <Text style={styles.startWorkoutButtonText}>
                              {startingWorkout
                                ? "Starting..."
                                : `Start Workout with ${workout.name}`}
                            </Text>
                          </View>
                        </LinearGradient>
                      </BlurView>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#0d1117",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "90%",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalSafeArea: {
    flex: 1,
    maxHeight: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  contentSection: {
    flex: 1,
    padding: 24,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exercisesContainer: {
    flex: 1,
    marginBottom: 24,
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
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
  startWorkoutButton: {
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  startWorkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default PreMadeWorkoutDetailsModal;

