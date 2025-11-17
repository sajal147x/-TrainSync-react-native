import React, { useState, useEffect, useRef } from "react";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import { addSetToExercise, updateSetInExercise, deleteSet, SetDto } from "../api/workout";

interface Set {
  id: string;
  setId?: string; // Backend set ID after saving
  weight: string;
  reps: string;
  isSaved: boolean;
}

interface EditExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  exerciseId: string;
  existingSets?: SetDto[];
}

const EditExerciseModal: React.FC<EditExerciseModalProps> = ({
  visible,
  onClose,
  exerciseName,
  exerciseId,
  existingSets = [],
}) => {
  console.log('EditExerciseModal rendered with exerciseId:', exerciseId, 'exerciseName:', exerciseName);
  
  const [sets, setSets] = useState<Set[]>([]);
  const [savingSetId, setSavingSetId] = useState<string | null>(null);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Pre-populate sets when modal opens with existing sets
  useEffect(() => {
    if (visible && existingSets.length > 0) {
      // Sort sets by setNumber before transforming
      const sortedSets = [...existingSets].sort((a, b) => a.setNumber - b.setNumber);
      const transformedSets: Set[] = sortedSets.map((setDto) => ({
        id: setDto.id,
        setId: setDto.id, // Use the backend ID
        weight: setDto.weight.toString(),
        reps: setDto.reps.toString(),
        isSaved: true, // Existing sets are already saved
      }));
      setSets(transformedSets);
    } else if (visible && existingSets.length === 0) {
      // Reset sets if no existing sets
      setSets([]);
    }
    
    // Close all swipeables when modal closes
    if (!visible) {
      Object.values(swipeableRefs.current).forEach((ref) => {
        ref?.close();
      });
    }
  }, [visible, existingSets]);

  const addSet = () => {
    const newSet: Set = {
      id: Date.now().toString(),
      weight: "",
      reps: "",
      isSaved: false,
    };
    setSets([...sets, newSet]);
  };

  const updateSet = (id: string, field: "weight" | "reps", value: string) => {
    setSets(
      sets.map((set) => (set.id === id ? { ...set, [field]: value } : set))
    );
  };

  const removeSet = async (id: string) => {
    const setToRemove = sets.find((s) => s.id === id);
    if (!setToRemove) return;

    // Close the swipeable if it's open
    if (swipeableRefs.current[id]) {
      swipeableRefs.current[id]?.close();
    }

    // Filter out the set to be removed
    const remainingSets = sets.filter((set) => set.id !== id);
    
    // If the set was saved (has a setId), call the API to delete it
    if (setToRemove.setId) {
      try {
        // Calculate new order for remaining saved sets
        const newSets = remainingSets
          .filter((set) => set.setId) // Only include saved sets
          .map((set, index) => ({
            id: set.setId!,
            setNumber: index + 1, // 1-indexed set numbers
          }));

        await deleteSet({
          deletedSetId: setToRemove.setId,
          newSets,
        });
      } catch (error) {
        console.error("Failed to delete set:", error);
        // TODO: Show error to user
        return; // Don't update local state if API call fails
      }
    }

    // Update local state with remaining sets
    setSets(remainingSets);
    // Clean up the ref
    delete swipeableRefs.current[id];
  };

  const saveSet = async (id: string) => {
    const set = sets.find((s) => s.id === id);
    if (!set || !set.weight || !set.reps) return;

    setSavingSetId(id);
    try {
      if (set.setId) {
        // Update existing set
        console.log('Updating existing set with ID:', set.setId);
        await updateSetInExercise({
          setId: set.setId,
          weight: set.weight,
          reps: set.reps,
        });
      } else {
        // Create new set
        const setIndex = sets.findIndex((s) => s.id === id);
        const setNumber = setIndex + 1;
        

        const requestPayload = {
          exerciseId,
          weight: set.weight,
          reps: set.reps,
          setNumber,
        };
        
        const setId = await addSetToExercise(requestPayload);
        setSets(
          sets.map((s) =>
            s.id === id ? { ...s, setId, isSaved: true } : s
          )
        );
      }
      
      // Mark as saved if updating
      if (set.setId) {
        setSets(
          sets.map((s) =>
            s.id === id ? { ...s, isSaved: true } : s
          )
        );
      }
    } catch (error) {
      console.error("Failed to save set:", error);
      // TODO: Show error to user
    } finally {
      setSavingSetId(null);
    }
  };

  const editSet = (id: string) => {
    // Close the swipeable if it's open
    if (swipeableRefs.current[id]) {
      swipeableRefs.current[id]?.close();
    }
    setSets(
      sets.map((set) => (set.id === id ? { ...set, isSaved: false } : set))
    );
  };

  const renderRightActions = (id: string) => {
    return (
      <View style={styles.rightActionContainer}>
        <TouchableOpacity
          style={styles.deleteActionButton}
          onPress={() => removeSet(id)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
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
              <GestureHandlerRootView style={{ flex: 1 }}>
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
                      <Swipeable
                        key={set.id}
                        ref={(ref) => {
                          swipeableRefs.current[set.id] = ref;
                        }}
                        renderRightActions={() => renderRightActions(set.id)}
                        overshootRight={false}
                        friction={2}
                      >
                        <View style={styles.setItem}>
                          <View style={styles.setHeader}>
                            <Text style={styles.setNumber}>Set {index + 1}</Text>
                            <View style={styles.actionButtons}>
                              {set.isSaved ? (
                                <TouchableOpacity
                                  onPress={() => editSet(set.id)}
                                  style={styles.editButton}
                                >
                                  <Ionicons name="pencil-outline" size={20} color="#3b82f6" />
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => saveSet(set.id)}
                                  style={styles.saveButton}
                                  disabled={savingSetId === set.id}
                                >
                                  {savingSetId === set.id ? (
                                    <ActivityIndicator size="small" color="#10b981" />
                                  ) : (
                                    <Ionicons name="save-outline" size={20} color="#10b981" />
                                  )}
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                onPress={() => removeSet(set.id)}
                                style={styles.removeButton}
                              >
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View style={styles.inputRow}>
                            <View style={styles.inputContainer}>
                              <Text style={styles.inputLabel}>Weight (lbs)</Text>
                              <TextInput
                                style={[
                                  styles.input,
                                  set.isSaved && styles.inputReadOnly,
                                ]}
                                value={set.weight}
                                onChangeText={(value) =>
                                  updateSet(set.id, "weight", value)
                                }
                                placeholder="0"
                                placeholderTextColor="#6b7280"
                                keyboardType="numeric"
                                editable={!set.isSaved}
                              />
                            </View>
                            <View style={styles.inputContainer}>
                              <Text style={styles.inputLabel}>Reps</Text>
                              <TextInput
                                style={[
                                  styles.input,
                                  set.isSaved && styles.inputReadOnly,
                                ]}
                                value={set.reps}
                                onChangeText={(value) =>
                                  updateSet(set.id, "reps", value)
                                }
                                placeholder="0"
                                placeholderTextColor="#6b7280"
                                keyboardType="numeric"
                                editable={!set.isSaved}
                              />
                            </View>
                          </View>
                        </View>
                      </Swipeable>
                    ))
                  )}
                </ScrollView>
              </GestureHandlerRootView>

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
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
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
    gap: 12,
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
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButton: {
    padding: 4,
  },
  editButton: {
    padding: 4,
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
  inputReadOnly: {
    backgroundColor: "rgba(17, 24, 39, 0.3)",
    borderColor: "rgba(59, 130, 246, 0.15)",
    opacity: 0.8,
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
  doneButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  rightActionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  deleteActionButton: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  deleteActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default EditExerciseModal;

