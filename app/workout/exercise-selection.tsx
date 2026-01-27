import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getExercises,
  ExerciseDto,
  getMuscleTags,
  getEquipmentTags,
  EquipmentTagDto,
  MuscleTagDto,
  GetExercisesParams,
} from "../api/workout/exercises";
import ExerciseDetailsModal from "../components/ExerciseDetailsModal";

const ExerciseSelection: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutName = (params.workoutName as string) || "";
  const workoutDate = (params.workoutDate as string) || new Date().toISOString();
  const workoutId = params.workoutId as string | undefined;
  const mode = (params.mode as string) || "add"; // "add" or "switch"
  const currentExerciseId = params.currentExerciseId as string | undefined;
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [muscleTags, setMuscleTags] = useState<MuscleTagDto[]>([]);
  const [selectedMuscleTag, setSelectedMuscleTag] = useState<MuscleTagDto | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [equipmentTags, setEquipmentTags] = useState<EquipmentTagDto[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [isEquipmentDropdownOpen, setIsEquipmentDropdownOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const lastRequestRef = useRef<boolean | null>(null);

  useEffect(() => {
    fetchExercises();
    fetchMuscleTags();
    fetchEquipmentTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          fetchExercises();
        }
      }, 500); // 500ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchText, selectedMuscleTag, selectedEquipment]);

  const fetchExercises = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      lastRequestRef.current = true;

      try {
        const params: GetExercisesParams = {
          size: 10000, // Fetch all exercises in one call
        };

        if (searchText && searchText.length >= 3) {
          params.searchText = searchText;
        }
        if (selectedMuscleTag) {
          params.muscleTag = selectedMuscleTag.id;
        }
        if (selectedEquipment) {
          params.equipmentTag = selectedEquipment;
        }

        const data = await getExercises(params);

        setExercises(data);
        lastRequestRef.current = null;
      } catch (err: any) {
        console.error("Error fetching exercises:", err);
        setError(err.response?.data?.message || "Failed to fetch exercises");
      } finally {
        setLoading(false);
      }
    },
    [searchText, selectedMuscleTag, selectedEquipment]
  );

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

  const handleRetry = () => {
    fetchExercises();
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

    return (
      <TouchableOpacity
        style={styles.exerciseCard}
        onPress={() => handleExercisePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseCardContent}>
          <View style={styles.exerciseCardLeft}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.exerciseMetaRow}>
              {primaryMuscleTags.length > 0 && (
                <Text style={styles.muscleText}>
                  {primaryMuscleTags.map((tag) => tag.name.toUpperCase()).join(", ")}
                </Text>
              )}
            </View>
          </View>
          {item.exercisePictureUrl && (
            <View style={styles.exerciseImageContainer}>
              <Image
                source={{ uri: item.exercisePictureUrl }}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
            </View>
          )}
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
            {selectedMuscleTag?.name || "All Muscle Groups"}
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
                    key={tag.id}
                    style={[
                      styles.dropdownItem,
                      selectedMuscleTag?.id === tag.id &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedMuscleTag(tag);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedMuscleTag?.id === tag.id &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {tag.name}
                    </Text>
                    {selectedMuscleTag?.id === tag.id && (
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
              onPress={handleRetry}
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
              keyExtractor={(item, index) => 
                item.equipmentTag 
                  ? `${item.id}-${item.equipmentTag.id}` 
                  : `${item.id}-${index}`
              }
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
        mode={mode as "add" | "switch"}
        currentExerciseId={currentExerciseId}
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
  loadingMoreContainer: {
    paddingVertical: 12,
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
  exerciseCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  exerciseCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  exerciseImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  exerciseMetaRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 4,
  },
  muscleText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default ExerciseSelection;

