import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { addSetToExercise, updateSetInExercise, deleteSet, SetDto, getSets } from "../api/workout";

interface Set {
  id: string;
  setId?: string; // Backend set ID after saving
  weight: string;
  reps: string;
  isSaved: boolean;
}

const EditExercise: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const exerciseId = params.exerciseId as string;
  const exerciseName = params.exerciseName as string;
  const exercisePictureUrl = params.exercisePictureUrl as string | undefined;
  const preFilledFlag = params.preFilledFlag as string | undefined;
  const preFilledDate = params.preFilledDate as string | undefined;
  const preFilledWorkoutName = params.preFilledWorkoutName as string | undefined;
  const workoutId = params.workoutId as string | undefined;
  
  const [sets, setSets] = useState<Set[]>([]);
  const [savingSetId, setSavingSetId] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exerciseSelectionVisible, setExerciseSelectionVisible] = useState(false);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Format date from ISO format to "Nov 20, 2025" format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Fetch existing sets when component mounts
  useEffect(() => {
    const fetchSets = async () => {
      if (!exerciseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const exerciseData = await getSets(exerciseId);
        if (exerciseData.sets && exerciseData.sets.length > 0) {
          // Sort sets by setNumber before transforming
          const sortedSets = [...exerciseData.sets].sort((a, b) => a.setNumber - b.setNumber);
          const transformedSets: Set[] = sortedSets.map((setDto) => ({
            id: setDto.id,
            setId: setDto.id, // Use the backend ID
            weight: setDto.weight.toString(),
            reps: setDto.reps.toString(),
            isSaved: true, // Existing sets are already saved
          }));
          setSets(transformedSets);
        } else {
          setSets([]);
        }
      } catch (error) {
        console.error("Error fetching sets:", error);
        setSets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, [exerciseId]);

  // Close all swipeables when component unmounts
  useEffect(() => {
    return () => {
      Object.values(swipeableRefs.current).forEach((ref) => {
        ref?.close();
      });
    };
  }, []);

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

  const handleChangeExercise = () => {
    if (!workoutId) {
      console.error("workoutId is required to change exercise");
      return;
    }
    router.push({
      pathname: "/workout/exercise-selection",
      params: {
        workoutId: workoutId,
        mode: "switch",
        currentExerciseId: exerciseId,
      },
    });
  };

  const renderLeftActions = (id: string, set: Set) => {
    if (!set.isSaved) return null;
    
    return (
      <View style={styles.leftActionContainer}>
        <TouchableOpacity
          style={styles.editActionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            editSet(id);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={22} color="#fff" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightActions = (id: string) => {
    return (
      <View style={styles.rightActionContainer}>
        <TouchableOpacity
          style={styles.deleteActionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeSet(id);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={22} color="#fff" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            {exercisePictureUrl && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setImageModalVisible(true);
                }}
                activeOpacity={0.8}
                style={styles.headerImageContainer}
              >
                <Image
                  source={{ uri: exercisePictureUrl }}
                  style={styles.headerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{exerciseName || "Edit Exercise"}</Text>
          </View>
          {workoutId ? (
            <TouchableOpacity
              style={styles.changeExerciseButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleChangeExercise();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={20} color="#3b82f6" />
              <Text style={styles.changeExerciseButtonText}>Change</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Sets List */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ScrollView
            style={styles.setsContainer}
            showsVerticalScrollIndicator={false}
          >
            {preFilledFlag === "YES" && preFilledDate && (
              <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={styles.infoBannerText}>
                  Pre filled from {preFilledWorkoutName || "workout"} on {formatDate(preFilledDate)}
                </Text>
              </View>
            )}
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
                  renderLeftActions={() => renderLeftActions(set.id, set)}
                  renderRightActions={() => renderRightActions(set.id)}
                  overshootLeft={false}
                  overshootRight={false}
                  friction={1.5}
                  leftThreshold={40}
                  rightThreshold={40}
                  onSwipeableWillOpen={(direction) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
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
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Enlarged Image Modal */}
      {imageModalVisible && exercisePictureUrl && (
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalBackdrop}
            activeOpacity={1}
            onPress={() => setImageModalVisible(false)}
          />
          <View style={styles.imageModalContent}>
            <TouchableOpacity
              style={styles.imageModalCloseButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: exercisePictureUrl }}
              style={styles.enlargedImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  headerImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    backgroundColor: "rgba(31, 41, 55, 0.6)",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    flexShrink: 1,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  changeExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  changeExerciseButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
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
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  leftActionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 4,
  },
  rightActionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 12,
    paddingRight: 4,
  },
  editActionButton: {
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: "100%",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  deleteActionButton: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: "100%",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  infoBanner: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  infoBannerText: {
    color: "#93c5fd",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  imageModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  imageModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  imageModalContent: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  imageModalCloseButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  enlargedImage: {
    width: "100%",
    height: "100%",
  },
});

export default EditExercise;

