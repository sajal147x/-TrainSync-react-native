import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getExercises, ExerciseDto, getMuscleTags, getEquipmentTags, EquipmentTagDto } from "../api/exercises";
import ExerciseDetailsModal from "../components/ExerciseDetailsModal";

const ExerciseSelection: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutName = (params.workoutName as string) || "";
  const workoutDate = (params.workoutDate as string) || new Date().toISOString();
  const workoutId = params.workoutId as string | undefined;
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [muscleTags, setMuscleTags] = useState<string[]>([]);
  const [selectedMuscleTag, setSelectedMuscleTag] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [equipmentTags, setEquipmentTags] = useState<EquipmentTagDto[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [isEquipmentDropdownOpen, setIsEquipmentDropdownOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchExercises();
    fetchMuscleTags();
    fetchEquipmentTags();
  }, []);

  useEffect(() => {
    // Skip debounced fetch on initial mount (already fetched above)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Debounce search - only search if 3+ characters or empty (to show all)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (searchText.length >= 3 || searchText.length === 0) {
        fetchExercises(searchText, selectedMuscleTag, selectedEquipment);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchText, selectedMuscleTag, selectedEquipment]);

  const fetchExercises = async (search?: string, muscleTag?: string | null, equipmentId?: string | null) => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {};
      if (search && search.length >= 3) {
        params.searchText = search;
      }
      if (muscleTag) {
        params.muscleTag = muscleTag;
      }
      if (equipmentId) {
        params.equipmentTag = equipmentId;
      }
      const data = await getExercises(params);
      setExercises(data);
    } catch (err: any) {
      console.error("Error fetching exercises:", err);
      setError(err.response?.data?.message || "Failed to fetch exercises");
    } finally {
      setLoading(false);
    }
  };

  const fetchMuscleTags = async () => {
    try {
      const tags = await getMuscleTags();
      setMuscleTags(tags);
    } catch (err: any) {
      console.error("Error fetching muscle tags:", err);
      // Silently fail for muscle tags, not critical
    }
  };

  const fetchEquipmentTags = async () => {
    try {
      const tags = await getEquipmentTags();
      setEquipmentTags(tags);
    } catch (err: any) {
      console.error("Error fetching equipment tags:", err);
      // Silently fail for equipment tags, not critical
    }
  };

  const handleExercisePress = (exercise: ExerciseDto) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const handleAddToWorkout = (exercise: ExerciseDto) => {
    console.log("Adding exercise to workout:", exercise);
    // TODO: Add exercise to workout and navigate back
    router.back();
  };

  const renderExerciseItem = ({ item }: { item: ExerciseDto }) => {
    const primaryMuscleTags = item.muscleTags.filter(
      (tag) => tag.level === "PRIMARY"
    );
    const equipmentList =
      item.equipmentTags.length > 0
        ? `(${item.equipmentTags.map((tag) => tag.name).join(", ")})`
        : "(No equipment listed)";

    return (
      <TouchableOpacity
        style={styles.exerciseCard}
        onPress={() => handleExercisePress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.exerciseName}>{item.name}</Text>
        <View style={styles.exerciseMetaRow}>
          <View style={styles.tagsContainer}>
            {primaryMuscleTags.map((tag, index) => {
              const rotation =
                index % 3 === 0 ? "-1deg" : index % 3 === 1 ? "1deg" : "0deg";
              return (
                <View
                  key={index}
                  style={[
                    styles.tagStickyNote,
                    styles.tagStickyNotePrimary,
                    { transform: [{ rotate: rotation }] },
                  ]}
                >
                  <Text style={[styles.tagText, styles.tagTextPrimary]}>
                    {tag.name}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.equipmentBox}>
            <Text style={styles.equipmentText}>{equipmentList}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.title}>Select Exercise</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9ca3af"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises (min 3 characters)..."
          placeholderTextColor="#6b7280"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setIsDropdownOpen(!isDropdownOpen);
            if (!isDropdownOpen) {
              setIsEquipmentDropdownOpen(false);
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="fitness"
            size={20}
            color="#9ca3af"
            style={styles.dropdownIcon}
          />
          <Text style={styles.dropdownButtonText}>
            {selectedMuscleTag || "All Muscle Groups"}
          </Text>
          <Ionicons
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownList}>
            <ScrollView
              style={styles.dropdownScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  !selectedMuscleTag && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  setSelectedMuscleTag(null);
                  setIsDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    !selectedMuscleTag && styles.dropdownItemTextSelected,
                  ]}
                >
                  All Muscle Groups
                </Text>
                {!selectedMuscleTag && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>

              {muscleTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.dropdownItem,
                    selectedMuscleTag === tag && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedMuscleTag(tag);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedMuscleTag === tag &&
                        styles.dropdownItemTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                  {selectedMuscleTag === tag && (
                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setIsEquipmentDropdownOpen(!isEquipmentDropdownOpen);
            if (!isEquipmentDropdownOpen) {
              setIsDropdownOpen(false);
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="barbell"
            size={20}
            color="#9ca3af"
            style={styles.dropdownIcon}
          />
          <Text style={styles.dropdownButtonText}>
            {selectedEquipment
              ? equipmentTags.find((eq) => eq.id === selectedEquipment)?.name || "All Equipment"
              : "All Equipment"}
          </Text>
          <Ionicons
            name={isEquipmentDropdownOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>

        {isEquipmentDropdownOpen && (
          <View style={styles.dropdownList}>
            <ScrollView
              style={styles.dropdownScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  !selectedEquipment && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  setSelectedEquipment(null);
                  setIsEquipmentDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    !selectedEquipment && styles.dropdownItemTextSelected,
                  ]}
                >
                  All Equipment
                </Text>
                {!selectedEquipment && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>

              {equipmentTags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.dropdownItem,
                    selectedEquipment === tag.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedEquipment(tag.id);
                    setIsEquipmentDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedEquipment === tag.id &&
                        styles.dropdownItemTextSelected,
                    ]}
                  >
                    {tag.name}
                  </Text>
                  {selectedEquipment === tag.id && (
                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {searchText.length > 0 && searchText.length < 3 && (
        <View style={styles.searchHintContainer}>
          <Text style={styles.searchHintText}>
            Type at least 3 characters to search
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchExercises(searchText, selectedMuscleTag, selectedEquipment)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <>
          {exercises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyText}>
                {searchText.length >= 3
                  ? "No exercises found"
                  : "Start searching to find exercises"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={exercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.exercisesList}
              style={styles.exercisesFlatList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      <ExerciseDetailsModal
        visible={modalVisible}
        exercise={selectedExercise}
        onClose={() => setModalVisible(false)}
        onAddToWorkout={handleAddToWorkout}
        workoutName={workoutName}
        workoutDate={workoutDate}
        workoutId={workoutId}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  dropdownContainer: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  dropdownIcon: {
    marginRight: 8,
  },
  dropdownButtonText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    maxHeight: 180,
    overflow: "hidden",
  },
  dropdownScrollView: {
    flexGrow: 0,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(59, 130, 246, 0.1)",
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  dropdownItemText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  searchHintContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  searchHintText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
    minHeight: 200,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    minHeight: 200,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    minHeight: 200,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
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
  exercisesList: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  exercisesFlatList: {
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  exerciseName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  exerciseMetaRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    flexShrink: 1,
    flexGrow: 0,
  },
  tagStickyNote: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tagStickyNotePrimary: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  tagStickyNoteSecondary: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  tagText: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "600",
  },
  tagTextPrimary: {
    color: "#166534",
  },
  tagTextSecondary: {
    color: "#78350f",
  },
  equipmentBox: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.4)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 2,
  },
  equipmentText: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ExerciseSelection;

