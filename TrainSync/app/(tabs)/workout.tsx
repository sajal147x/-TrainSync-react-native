import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getRecentWorkouts, RecentWorkoutDto } from "../api/workoutTab";

const Workout: React.FC = () => {
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  const loadRecentWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const workouts = await getRecentWorkouts();
      setRecentWorkouts(workouts);
    } catch (err) {
      console.error("Failed to load recent workouts:", err);
      setError("Failed to load recent workouts");
    } finally {
      setLoading(false);
    }
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
      <View style={styles.content}>
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

        <View style={styles.recentWorkoutsContainer}>
          <Text style={styles.recentWorkoutsTitle}>Recent Workouts</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : recentWorkouts.length === 0 ? (
            <Text style={styles.emptyText}>No recent workouts found</Text>
          ) : (
            <FlatList
              data={recentWorkouts}
              keyExtractor={(item) => item.workoutId}
              renderItem={({ item }) => (
                <View style={styles.workoutCard}>
                  <BlurView intensity={60} tint="dark" style={styles.cardBlur}>
                    <View style={styles.cardContent}>
                      <Text style={styles.workoutName}>{item.workoutName}</Text>
                      <Text style={styles.workoutDate}>{formatDate(item.workoutDate)}</Text>
                    </View>
                  </BlurView>
                </View>
              )}
              style={styles.workoutList}
              contentContainerStyle={styles.workoutListContent}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
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
    flex: 1,
    width: "100%",
  },
  recentWorkoutsTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  loader: {
    marginTop: 32,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  workoutList: {
    flex: 1,
  },
  workoutListContent: {
    paddingBottom: 24,
  },
  workoutCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  cardBlur: {
    borderRadius: 12,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
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
});

export default Workout; // ✅ default export
