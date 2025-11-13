import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getExercises, ExerciseDto, getMuscleTags } from "../api/exercises";

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDto) => void;
}

const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
  visible,
  onClose,
  onSelectExercise,
}) => {
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [muscleTags, setMuscleTags] = useState<string[]>([]);
  const [selectedMuscleTag, setSelectedMuscleTag] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      fetchExercises();
      fetchMuscleTags();
    } else {
      // Reset search when modal closes
      setSearchText("");
      setSelectedMuscleTag(null);
      setIsDropdownOpen(false);
    }
  }, [visible]);

  useEffect(() => {
    // Debounce search - only search if 3+ characters or empty (to show all)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (searchText.length >= 3 || searchText.length === 0) {
        fetchExercises(searchText);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchText]);

  const fetchExercises = async (search?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = search && search.length >= 3 ? { searchText: search } : {};
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

  const handleSelectExercise = (exercise: ExerciseDto) => {
    onSelectExercise(exercise);
    onClose();
  };

  const renderExerciseItem = ({ item }: { item: ExerciseDto }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleSelectExercise(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={styles.tagsContainer}>
        {item.muscleTags.map((tag, index) => {
          // Vary rotation for more natural sticky note effect
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
    </TouchableOpacity>
  );

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
              <Text style={styles.modalTitle}>Select Exercise</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
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
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="barbell"
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
                  onPress={() => fetchExercises(searchText)}
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  tagText: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ExerciseSelectionModal;

