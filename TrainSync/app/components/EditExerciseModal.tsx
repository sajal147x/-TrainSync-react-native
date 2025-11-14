import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface Set {
  id: string;
  weight: string;
  reps: string;
}

interface EditExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
}

const EditExerciseModal: React.FC<EditExerciseModalProps> = ({
  visible,
  onClose,
  exerciseName,
}) => {
  const [sets, setSets] = useState<Set[]>([]);

  const addSet = () => {
    const newSet: Set = {
      id: Date.now().toString(),
      weight: "",
      reps: "",
    };
    setSets([...sets, newSet]);
  };

  const updateSet = (id: string, field: "weight" | "reps", value: string) => {
    setSets(
      sets.map((set) => (set.id === id ? { ...set, [field]: value } : set))
    );
  };

  const removeSet = (id: string) => {
    setSets(sets.filter((set) => set.id !== id));
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafeArea}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{exerciseName}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Sets List */}
              <ScrollView
                style={styles.setsContainer}
                showsVerticalScrollIndicator={false}
              >
                {sets.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="barbell-outline" size={48} color="#4b5563" />
                    <Text style={styles.emptyStateText}>
                      No sets added yet
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Tap "Add Set" to get started
                    </Text>
                  </View>
                ) : (
                  sets.map((set, index) => (
                    <View key={set.id} style={styles.setItem}>
                      <View style={styles.setHeader}>
                        <Text style={styles.setNumber}>Set {index + 1}</Text>
                        <TouchableOpacity
                          onPress={() => removeSet(set.id)}
                          style={styles.removeButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.inputRow}>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Weight (lbs)</Text>
                          <TextInput
                            style={styles.input}
                            value={set.weight}
                            onChangeText={(value) =>
                              updateSet(set.id, "weight", value)
                            }
                            placeholder="0"
                            placeholderTextColor="#6b7280"
                            keyboardType="numeric"
                          />
                        </View>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Reps</Text>
                          <TextInput
                            style={styles.input}
                            value={set.reps}
                            onChangeText={(value) =>
                              updateSet(set.id, "reps", value)
                            }
                            placeholder="0"
                            placeholderTextColor="#6b7280"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              {/* Add Set Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={addSet}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#fff" />
                  <Text style={styles.addSetButtonText}>Add Set</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
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
  modalContainer: {
    width: "100%",
    height: "90%",
  },
  modalContent: {
    backgroundColor: "#0d1117",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "100%",
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
  setsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyStateText: {
    color: "#9ca3af",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 8,
  },
  setItem: {
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  setNumber: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "700",
  },
  removeButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  addSetButton: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addSetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditExerciseModal;

