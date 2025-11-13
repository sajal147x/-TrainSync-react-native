import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ExerciseDto } from "../api/exercises";

interface ExerciseDetailsModalProps {
  visible: boolean;
  exercise: ExerciseDto | null;
  onClose: () => void;
  onAddToWorkout: (exercise: ExerciseDto) => void;
}

const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProps> = ({
  visible,
  exercise,
  onClose,
  onAddToWorkout,
}) => {
  if (!exercise) return null;

  const handleAddToWorkout = () => {
    onAddToWorkout(exercise);
    onClose();
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
              <Text style={styles.modalTitle}>Exercise Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.contentSection}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>

              <View style={styles.musclesSection}>
                <Text style={styles.sectionLabel}>Muscles Hit</Text>
                <View style={styles.tagsContainer}>
                  {exercise.muscleTags.map((tag, index) => {
                    const rotation =
                      index % 3 === 0 ? "-1deg" : index % 3 === 1 ? "1deg" : "0deg";
                    return (
                      <View
                        key={index}
                        style={[
                          styles.tagStickyNote,
                          { transform: [{ rotate: rotation }] },
                        ]}
                      >
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddToWorkout}
                activeOpacity={0.8}
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
                      <Ionicons name="add-circle" size={24} color="#fff" />
                      <Text style={styles.addButtonText}>Add Exercise to Workout</Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
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
  },
  closeButton: {
    padding: 8,
  },
  contentSection: {
    padding: 24,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
  },
  musclesSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tagStickyNote: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tagText: {
    color: "#78350f",
    fontSize: 14,
    fontWeight: "600",
  },
  addButton: {
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
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ExerciseDetailsModal;

