import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getPreMadeWorkouts, PreMadeWorkoutListItem } from "../api/PreMadeWorkout";

const PreMadeWorkouts: React.FC = () => {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<PreMadeWorkoutListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      const data = await getPreMadeWorkouts();
      setWorkouts(data);
    } catch (err: any) {
      console.error("Error fetching pre-made workouts:", err);
      setError(err.response?.data?.message || "Failed to load workouts");
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts(true);
    setRefreshing(false);
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
        <Text style={styles.headerTitle}>Pre-Made Workouts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={["#3b82f6"]}
            progressBackgroundColor="#0d1117"
          />
        }
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
      >
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => router.push("/PreMadeWorkouts/newPreMade")}
          activeOpacity={0.8}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            <LinearGradient
              colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientOverlay}
            >
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Create new workout</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>


        <View style={styles.recentWorkoutsContainer}>
          <Text style={styles.recentWorkoutsTitle}>Pre-Made Workouts</Text>

          <View style={styles.workoutsListContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : error ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : workouts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No pre-made workouts available</Text>
              </View>
            ) : (
              <FlatList
                data={workouts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.workoutItem}
                    activeOpacity={0.7}
                    onPress={() => router.push({
                      pathname: "/PreMadeWorkouts/continue",
                      params: { preMadeWorkoutId: item.id }
                    })}
                  >
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{item.name}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => router.push({
                        pathname: "/PreMadeWorkouts/continue",
                        params: { preMadeWorkoutId: item.id }
                      })}
                    >
                      <Ionicons name="create-outline" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                style={styles.workoutList}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  buttonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 32,
  },
  blurView: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientOverlay: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  recentWorkoutsContainer: {
    width: "100%",
    marginTop: 8,
  },
  recentWorkoutsTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  workoutsListContainer: {
    padding: 12,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
  },
  workoutList: {
    flexGrow: 0,
  },
  workoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156, 163, 175, 0.3)",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  workoutSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default PreMadeWorkouts;

