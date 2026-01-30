import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getRecentWorkouts, RecentWorkoutDto } from "../api/workout/workoutTab";

const Workout: React.FC = () => {
  const router = useRouter();
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  const loadRecentWorkouts = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      const workouts = await getRecentWorkouts();
      setRecentWorkouts(workouts);
    } catch (err) {
      console.error("Failed to load recent workouts:", err);
      setError("Failed to load recent workouts");
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentWorkouts(true);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>Workout</Text>
        
        <Link href="/workout/new" asChild>
          <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8}>
            <BlurView intensity={80} tint="dark" style={styles.blurView}>
              <LinearGradient
                colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientOverlay}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Log/Start new workout</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Link>

        <Link href="/PreMadeWorkouts/PreMadeWorkouts" asChild>
          <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8}>
            <BlurView intensity={80} tint="dark" style={styles.blurView}>
              <LinearGradient
                colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientOverlay}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Pre-Made Workouts</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Link>

        <View style={styles.recentWorkoutsContainer}>
          <Text style={styles.recentWorkoutsTitle}>Recent Workouts</Text>
          
          <View style={styles.workoutsListContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : error ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : recentWorkouts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No recent workouts found</Text>
              </View>
            ) : (
              <FlatList
                data={recentWorkouts}
                keyExtractor={(item) => item.workoutId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.workoutItem}
                    activeOpacity={0.7}
                    onPress={() => router.push({
                      pathname: "/workout/continue",
                      params: { workoutId: item.workoutId }
                    })}
                  >
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{item.workoutName}</Text>
                      <Text style={styles.workoutDate}>{formatDate(item.workoutDate)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => router.push({
                        pathname: "/workout/continue",
                        params: { workoutId: item.workoutId }
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    flexGrow: 1,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
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
  workoutDate: {
    color: "#9ca3af",
    fontSize: 14,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default Workout; // ? default export
