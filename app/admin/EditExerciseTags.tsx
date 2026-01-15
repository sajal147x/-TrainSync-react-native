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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getExercisesForEditTags,
  EditExerciseTagsDto,
  GetExercisesForEditTagsParams,
} from "../api/workout/exercises";

const PAGE_SIZE = 10;

export default function EditExerciseTags() {
  const router = useRouter();
  const [exercises, setExercises] = useState<EditExerciseTagsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const lastRequestRef = useRef<{ page: number; append: boolean } | null>(null);

  useEffect(() => {
    fetchExercisesPage(0, false);
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
        fetchExercisesPage(0, false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchText]);

  const fetchExercisesPage = useCallback(
    async (pageNumber: number, append = false) => {
      if (append) {
        setIsFetchingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      lastRequestRef.current = { page: pageNumber, append };

      try {
        const params: GetExercisesForEditTagsParams = {
          page: pageNumber,
          size: PAGE_SIZE,
        };

        if (searchText && searchText.length >= 3) {
          params.searchText = searchText;
        }

        const data = await getExercisesForEditTags(params);

        setExercises((prev) => {
          if (append) {
            // Deduplicate by exercise ID to prevent duplicate keys
            const existingIds = new Set(prev.map((ex) => ex.id));
            const newExercises = data.content.filter(
              (ex) => !existingIds.has(ex.id)
            );
            return [...prev, ...newExercises];
          } else {
            // Deduplicate even on initial load to prevent any duplicate keys
            const seenIds = new Set<string>();
            return data.content.filter((ex) => {
              if (seenIds.has(ex.id)) {
                return false;
              }
              seenIds.add(ex.id);
              return true;
            });
          }
        });

        setHasMore(!data.last);
        setPage(pageNumber);

        // Only update state if this is still the latest request
        if (
          lastRequestRef.current?.page === pageNumber &&
          lastRequestRef.current?.append === append
        ) {
          setError(null);
        }
      } catch (err: any) {
        console.error("Error fetching exercises:", err);
        const errorMessage =
          err?.response?.data?.message || "Failed to fetch exercises";
        setError(errorMessage);

        // Only update state if this is still the latest request
        if (
          lastRequestRef.current?.page === pageNumber &&
          lastRequestRef.current?.append === append
        ) {
          setError(errorMessage);
        }
      } finally {
        // Only update loading state if this is still the latest request
        if (
          lastRequestRef.current?.page === pageNumber &&
          lastRequestRef.current?.append === append
        ) {
          if (append) {
            setIsFetchingMore(false);
          } else {
            setLoading(false);
          }
        }
      }
    },
    [searchText]
  );

  const handleLoadMore = useCallback(() => {
    if (!loading && !isFetchingMore && hasMore) {
      fetchExercisesPage(page + 1, true);
    }
  }, [loading, isFetchingMore, hasMore, page, fetchExercisesPage]);

  const renderExerciseItem = ({ item }: { item: EditExerciseTagsDto }) => {
    return (
      <TouchableOpacity style={styles.exerciseCard} activeOpacity={0.8}>
        <View style={styles.exerciseCardContent}>
          <View style={styles.exerciseCardLeft}>
            <Text style={styles.exerciseName}>{item.name}</Text>

            {item.muscleTags && item.muscleTags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsSectionTitle}>Muscle Tags:</Text>
                <View style={styles.tagsContainer}>
                  {item.muscleTags.map((tag, index) => (
                    <View
                      key={`${item.id}-muscle-${tag.id || 'unknown'}-${index}`}
                      style={[
                        styles.tagStickyNote,
                        tag.level === "PRIMARY"
                          ? styles.tagStickyNotePrimary
                          : styles.tagStickyNoteSecondary,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          tag.level === "PRIMARY"
                            ? styles.tagTextPrimary
                            : styles.tagTextSecondary,
                        ]}
                      >
                        {tag.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {item.equipmentTags && item.equipmentTags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsSectionTitle}>Equipment Tags:</Text>
                <View style={styles.tagsContainer}>
                  {item.equipmentTags.map((tag, index) => (
                    <View key={`${item.id}-equipment-${tag.id || 'unknown'}-${index}`} style={styles.equipmentTag}>
                      <Text style={styles.equipmentTagText}>{tag.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(!item.muscleTags || item.muscleTags.length === 0) &&
              (!item.equipmentTags || item.equipmentTags.length === 0) && (
                <Text style={styles.noTagsText}>No tags assigned</Text>
              )}
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
        <Text style={styles.title}>Edit Exercise Tags</Text>
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
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchExercisesPage(0, false)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && exercises.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={64} color="#6b7280" />
          <Text style={styles.emptyText}>
            {searchText.length >= 3
              ? "No exercises found matching your search"
              : "No exercises available"}
          </Text>
        </View>
      )}

      {!loading && !error && exercises.length > 0 && (
        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.exercisesList}
          style={styles.exercisesFlatList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

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
  tagsSection: {
    marginBottom: 12,
  },
  tagsSectionTitle: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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
  equipmentTag: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  equipmentTagText: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "600",
  },
  noTagsText: {
    color: "#6b7280",
    fontSize: 14,
    fontStyle: "italic",
  },
});

