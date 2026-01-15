import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getWorkout, Workout, ExerciseDto, deleteWorkout } from "../api/workout/workout";

const ContinueWorkout: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          onPress={() => router.push("/(tabs)/home")}
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
          onPress={() => router.push("/(tabs)/home")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{workout?.workoutName || "Workout"}</Text>
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => setShowOptionsModal(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>
            Exercises ({workout?.exercises?.length || 0})
          </Text>
          <View style={styles.exercisesListWrapper}>
            <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
              {workout?.exercises && workout.exercises.length > 0 ? (
                [...workout.exercises]
                  .sort((a, b) => (a.exerciseOrder || 0) - (b.exerciseOrder || 0))
                  .map((exercise, index, array) => (
                  <View 
                    key={index} 
                    style={[
                      styles.exerciseItem,
                      index < array.length - 1 && styles.exerciseItemWithBorder
                    ]}
                  >
                  {exercise.exercisePictureUrl ? (
                    <Image
                      source={{ uri: exercise.exercisePictureUrl }}
                      style={styles.exerciseImage}
                    />
                  ) : (
                    <View style={styles.exerciseNumber}>
                      <Text style={styles.exerciseNumberText}>{exercise.exerciseOrder || index + 1}</Text>
                    </View>
                  )}
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: "/workout/EditExercise" as any,
                        params: {
                          exerciseId: exercise.id,
                          exerciseName: exercise.name,
                          exercisePictureUrl: exercise.exercisePictureUrl || "",
                          preFilledFlag: exercise.preFilledFlag || "",
                          preFilledDate: exercise.preFilledDate || "",
                          preFilledWorkoutName: exercise.preFilledWorkoutName || "",
                          workoutId: workoutId,
                        },
                      });
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
        </View>

        <View style={styles.buttonsContainer}>
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
      </View>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.modalBackdrop} />
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Options</Text>
                <TouchableOpacity
                  onPress={() => setShowOptionsModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <TouchableOpacity
                  style={styles.modalOptionButton}
                  onPress={() => {
                    setShowOptionsModal(false);
                    router.push({
                      pathname: "/workout/convertWorkoutToPreMade" as any,
                      params: {
                        workoutId,
                        workoutName: workout?.workoutName || "",
                      },
                    });
                  }}
                >
                  <Ionicons name="copy-outline" size={24} color="#3b82f6" />
                  <Text style={styles.modalOptionText}>Convert to Pre Made Workout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOptionButton, styles.modalOptionButtonWithMargin]}
                  onPress={() => {
                    setShowOptionsModal(false);
                    // TODO: Implement functionality
                  }}
                >
                  <Ionicons name="play-outline" size={24} color="#3b82f6" />
                  <Text style={styles.modalOptionText}>Start new Workout with same exercises</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOptionButton, styles.modalOptionButtonWithMargin]}
                  onPress={() => {
                    setShowOptionsModal(false);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={24} color="#ef4444" />
                  <Text style={[styles.modalOptionText, styles.deleteOptionText]}>Delete Workout</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        visible={showDeleteDialog}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <TouchableOpacity
          style={styles.dialogOverlay}
          activeOpacity={1}
          onPress={() => setShowDeleteDialog(false)}
        >
          <View style={styles.dialogBackdrop} />
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.dialogContent}
          >
            <View style={styles.dialogHeader}>
              <Ionicons name="warning-outline" size={32} color="#ef4444" />
              <Text style={styles.dialogTitle}>Delete Workout</Text>
            </View>
            
            <Text style={styles.dialogMessage}>
              Are you sure you want to delete "{workout?.workoutName || "this workout"}"? This action cannot be undone.
            </Text>

            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonCancel]}
                onPress={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                <Text style={styles.dialogButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonDelete]}
                onPress={async () => {
                  if (!workoutId) return;
                  setDeleting(true);
                  try {
                    await deleteWorkout({ workoutId });
                    setShowDeleteDialog(false);
                    router.push("/(tabs)/home");
                  } catch (error) {
                    console.error("Error deleting workout:", error);
                    setDeleting(false);
                    setShowDeleteDialog(false);
                  }
                }}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.dialogButtonTextDelete}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  optionsButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "#0d1117",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "50%",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalSafeArea: {
    flex: 1,
    minHeight: 150,
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
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 24,
    minHeight: 100,
  },
  modalOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.3)",
    gap: 12,
  },
  modalOptionButtonWithMargin: {
    marginTop: 12,
  },
  modalOptionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  buttonsContainer: {
    marginTop: 24,
    gap: 12,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  exercisesContainer: {
    alignSelf: "stretch",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  exercisesListWrapper: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: 400,
    padding: 12,
  },
  exercisesList: {
    // ScrollView will size to content, constrained by parent maxHeight
  },
  exerciseItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  exerciseItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.3)",
  },
  exerciseNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseNumberText: {
    color: "#3b82f6",
    fontSize: 18,
    fontWeight: "700",
  },
  exerciseImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
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
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteOptionText: {
    color: "#ef4444",
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  dialogBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  dialogContent: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#374151",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  dialogHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  dialogTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  dialogMessage: {
    color: "#d1d5db",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  dialogButtons: {
    flexDirection: "row",
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  dialogButtonCancel: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  dialogButtonDelete: {
    backgroundColor: "#ef4444",
  },
  dialogButtonTextCancel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dialogButtonTextDelete: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ContinueWorkout;

