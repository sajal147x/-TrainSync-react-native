import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import {
  getEquipmentTags,
  getMuscleTags,
  editExercise,
  EquipmentTagDto,
  MuscleTagDto,
  ExerciseDto,
} from "../api/exercises";

export default function EditExercise() {
  const router = useRouter();
  const { exerciseData } = useLocalSearchParams<{ exerciseData: string }>();
  const [exercise, setExercise] = useState<ExerciseDto | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [equipmentTags, setEquipmentTags] = useState<EquipmentTagDto[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(
    new Set()
  );
  const [isEquipmentDropdownOpen, setIsEquipmentDropdownOpen] = useState(false);
  const [muscleTags, setMuscleTags] = useState<MuscleTagDto[]>([]);
  const [selectedPrimaryMuscles, setSelectedPrimaryMuscles] = useState<Set<string>>(
    new Set()
  );
  const [selectedSecondaryMuscles, setSelectedSecondaryMuscles] = useState<Set<string>>(
    new Set()
  );
  const [isPrimaryMuscleDropdownOpen, setIsPrimaryMuscleDropdownOpen] = useState(false);
  const [isSecondaryMuscleDropdownOpen, setIsSecondaryMuscleDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingExercise, setIsSavingExercise] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!exerciseData) {
        setSaveFeedback({
          type: "error",
          message: "Exercise data is missing.",
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Parse exercise data from route params
        const parsedExercise: ExerciseDto = JSON.parse(exerciseData);
        setExercise(parsedExercise);
        setExerciseName(parsedExercise.name);

        // Fetch equipment and muscle tags
        const [equipmentData, muscleData] = await Promise.all([
          getEquipmentTags(),
          getMuscleTags(),
        ]);
        setEquipmentTags(equipmentData);
        setMuscleTags(muscleData);

        // Pre-populate equipment
        const equipmentIds = new Set(
          parsedExercise.equipmentTags.map((tag) => tag.id)
        );
        setSelectedEquipment(equipmentIds);

        // Pre-populate primary and secondary muscles
        const primaryMuscleIds = new Set(
          parsedExercise.muscleTags
            .filter((tag) => tag.level === "PRIMARY")
            .map((tag) => tag.id)
        );
        const secondaryMuscleIds = new Set(
          parsedExercise.muscleTags
            .filter((tag) => tag.level === "SECONDARY")
            .map((tag) => tag.id)
        );
        setSelectedPrimaryMuscles(primaryMuscleIds);
        setSelectedSecondaryMuscles(secondaryMuscleIds);
      } catch (error) {
        console.error("Failed to parse exercise data:", error);
        setSaveFeedback({
          type: "error",
          message: "Failed to load exercise data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseData]);

  const toggleEquipment = (equipmentId: string) => {
    const newSelected = new Set(selectedEquipment);
    if (newSelected.has(equipmentId)) {
      newSelected.delete(equipmentId);
    } else {
      newSelected.add(equipmentId);
    }
    setSelectedEquipment(newSelected);
  };

  const getSelectedEquipmentNames = () => {
    return equipmentTags
      .filter((tag) => selectedEquipment.has(tag.id))
      .map((tag) => tag.name)
      .join(", ");
  };

  const getMuscleNameById = (id: string) => {
    return (
      muscleTags.find((muscle) => muscle.id === id)?.name ?? id
    );
  };

  const togglePrimaryMuscle = (muscleId: string) => {
    const newSelected = new Set(selectedPrimaryMuscles);
    if (newSelected.has(muscleId)) {
      newSelected.delete(muscleId);
    } else {
      newSelected.add(muscleId);
    }
    setSelectedPrimaryMuscles(newSelected);
  };

  const toggleSecondaryMuscle = (muscleId: string) => {
    const newSelected = new Set(selectedSecondaryMuscles);
    if (newSelected.has(muscleId)) {
      newSelected.delete(muscleId);
    } else {
      newSelected.add(muscleId);
    }
    setSelectedSecondaryMuscles(newSelected);
  };

  const getSelectedPrimaryMuscleNames = () => {
    return Array.from(selectedPrimaryMuscles)
      .map((muscleId) => getMuscleNameById(muscleId))
      .join(", ");
  };

  const getSelectedSecondaryMuscleNames = () => {
    return Array.from(selectedSecondaryMuscles)
      .map((muscleId) => getMuscleNameById(muscleId))
      .join(", ");
  };

  const handleSave = async () => {
    if (!exercise || !exercise.id) {
      setSaveFeedback({
        type: "error",
        message: "Exercise ID is missing.",
      });
      return;
    }

    if (!exerciseName.trim()) {
      setSaveFeedback({
        type: "error",
        message: "Exercise name cannot be empty.",
      });
      return;
    }

    setIsSavingExercise(true);
    setSaveFeedback(null);

    try {
      await editExercise({
        exerciseId: exercise.id,
        name: exerciseName.trim(),
        equipmentIds: Array.from(selectedEquipment),
        muscleTagIdsPrimary: Array.from(selectedPrimaryMuscles),
        muscleTagIdsSecondary: Array.from(selectedSecondaryMuscles),
      });

      setSaveFeedback({
        type: "success",
        message: "Exercise updated successfully.",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Failed to update exercise:", error);
      setSaveFeedback({
        type: "error",
        message: "Unable to update exercise. Please try again.",
      });
    } finally {
      setIsSavingExercise(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Exercise</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Exercise</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Exercise Name</Text>
          <View style={styles.nameDisplay}>
            <Text style={styles.nameText}>{exerciseName}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Equipment</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setIsEquipmentDropdownOpen(!isEquipmentDropdownOpen);
              setIsPrimaryMuscleDropdownOpen(false);
              setIsSecondaryMuscleDropdownOpen(false);
            }}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                selectedEquipment.size === 0 && styles.placeholderText,
              ]}
            >
              {selectedEquipment.size > 0
                ? getSelectedEquipmentNames() || "Select equipment"
                : "Select equipment"}
            </Text>
            <Ionicons
              name={isEquipmentDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>

          {isEquipmentDropdownOpen && (
            <View style={styles.dropdownContainer}>
              <ScrollView 
                nestedScrollEnabled={true}
                style={styles.dropdownScrollView}
                showsVerticalScrollIndicator={true}
              >
                {equipmentTags.length === 0 ? (
                  <Text style={styles.emptyText}>No equipment available</Text>
                ) : (
                  equipmentTags.map((equipment) => (
                    <TouchableOpacity
                      key={equipment.id}
                      style={styles.checkboxItem}
                      onPress={() => toggleEquipment(equipment.id)}
                    >
                      <View style={styles.checkbox}>
                        {selectedEquipment.has(equipment.id) && (
                          <Ionicons name="checkmark" size={16} color="#3b82f6" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{equipment.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Primary Muscles</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setIsPrimaryMuscleDropdownOpen(!isPrimaryMuscleDropdownOpen);
              setIsEquipmentDropdownOpen(false);
              setIsSecondaryMuscleDropdownOpen(false);
            }}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                selectedPrimaryMuscles.size === 0 && styles.placeholderText,
              ]}
            >
              {selectedPrimaryMuscles.size > 0
                ? getSelectedPrimaryMuscleNames() || "Select primary muscles"
                : "Select primary muscles"}
            </Text>
            <Ionicons
              name={isPrimaryMuscleDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>

          {isPrimaryMuscleDropdownOpen && (
            <View style={styles.dropdownContainer}>
              <ScrollView 
                nestedScrollEnabled={true}
                style={styles.dropdownScrollView}
                showsVerticalScrollIndicator={true}
              >
                {muscleTags.length === 0 ? (
                  <Text style={styles.emptyText}>No muscles available</Text>
                ) : (
                  muscleTags.map((muscle) => (
                    <TouchableOpacity
                      key={muscle.id}
                      style={styles.checkboxItem}
                      onPress={() => togglePrimaryMuscle(muscle.id)}
                    >
                      <View style={styles.checkbox}>
                        {selectedPrimaryMuscles.has(muscle.id) && (
                          <Ionicons name="checkmark" size={16} color="#3b82f6" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{muscle.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Secondary Muscles</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setIsSecondaryMuscleDropdownOpen(!isSecondaryMuscleDropdownOpen);
              setIsEquipmentDropdownOpen(false);
              setIsPrimaryMuscleDropdownOpen(false);
            }}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                selectedSecondaryMuscles.size === 0 && styles.placeholderText,
              ]}
            >
              {selectedSecondaryMuscles.size > 0
                ? getSelectedSecondaryMuscleNames() || "Select secondary muscles"
                : "Select secondary muscles"}
            </Text>
            <Ionicons
              name={isSecondaryMuscleDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>

          {isSecondaryMuscleDropdownOpen && (
            <View style={styles.dropdownContainer}>
              <ScrollView 
                nestedScrollEnabled={true}
                style={styles.dropdownScrollView}
                showsVerticalScrollIndicator={true}
              >
                {muscleTags.length === 0 ? (
                  <Text style={styles.emptyText}>No muscles available</Text>
                ) : (
                  muscleTags.map((muscle) => (
                    <TouchableOpacity
                      key={muscle.id}
                      style={styles.checkboxItem}
                      onPress={() => toggleSecondaryMuscle(muscle.id)}
                    >
                      <View style={styles.checkbox}>
                        {selectedSecondaryMuscles.has(muscle.id) && (
                          <Ionicons name="checkmark" size={16} color="#3b82f6" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{muscle.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isSavingExercise && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSavingExercise}
        >
          <Text style={styles.saveButtonText}>
            {isSavingExercise ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
        {saveFeedback && (
          <Text
            style={[
              styles.statusText,
              saveFeedback.type === "error"
                ? styles.errorText
                : styles.successText,
            ]}
          >
            {saveFeedback.message}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#cbd5e1",
    marginBottom: 8,
    fontWeight: "700",
  },
  nameDisplay: {
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  nameText: {
    fontSize: 16,
    color: "#f1f5f9",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#f1f5f9",
  },
  placeholderText: {
    color: "#64748b",
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#f1f5f9",
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    padding: 12,
    textAlign: "center",
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
  saveButtonContainer: {
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#f87171",
  },
  successText: {
    color: "#34d399",
  },
});

