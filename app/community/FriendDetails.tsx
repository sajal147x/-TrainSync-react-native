import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getFriendWorkoutSummary, FriendWorkoutSummaryDto } from "../api/community/friendWorkoutSummary";

const FriendDetails: React.FC = () => {
  const params = useLocalSearchParams();
  const friendUserId = params.userId as string;
  const friendName = params.name as string;
  const friendProfilePictureUrl = params.profilePictureUrl as string;

  const [summary, setSummary] = useState<FriendWorkoutSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutSummary();
  }, []);

  const fetchWorkoutSummary = async () => {
    try {
      setLoading(true);
      const data = await getFriendWorkoutSummary(friendUserId);
      setSummary(data);
    } catch (error: any) {
      console.error("Error fetching friend workout summary:", error);
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
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {friendProfilePictureUrl ? (
            <Image
              source={{ uri: friendProfilePictureUrl }}
              style={styles.profilePicture}
            />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Text style={styles.profilePictureText}>
                {friendName?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{friendName}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="large" />
            </View>
          ) : (
            <>
              {/* Workouts This Week */}
              <View style={styles.statCard}>
                <BlurView intensity={60} tint="dark" style={styles.statCardBlur}>
                  <View style={styles.statCardContent}>
                    <Text style={styles.statLabel}>Total Workouts Logged</Text>
                    <Text style={styles.statValue}>{summary?.workoutCountThisWeek ?? 0}</Text>
                  </View>
                </BlurView>
              </View>

              {/* Recent Workouts */}
              <View style={styles.recentWorkoutsContainer}>
                <Text style={styles.subsectionTitle}>Recent Workouts</Text>
                {summary?.recentWorkouts && summary.recentWorkouts.length > 0 ? (
                  summary.recentWorkouts.map((workout) => (
                    <View key={workout.workoutId} style={styles.workoutCard}>
                      <BlurView intensity={60} tint="dark" style={styles.workoutCardBlur}>
                        <View style={styles.workoutCardContent}>
                          <View style={styles.workoutInfo}>
                            <Text style={styles.workoutName}>{workout.workoutName}</Text>
                            <Text style={styles.workoutDate}>{formatDate(workout.workoutDate)}</Text>
                          </View>
                        </View>
                      </BlurView>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No recent workouts</Text>
                  </View>
                )}
              </View>
            </>
          )}
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(22, 27, 34, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 3,
    borderColor: "rgba(59, 130, 246, 0.4)",
    marginBottom: 16,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderWidth: 3,
    borderColor: "rgba(59, 130, 246, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profilePictureText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "600",
  },
  name: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  summarySection: {
    marginTop: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  statCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  statCardBlur: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(22, 27, 34, 0.6)",
  },
  statCardContent: {
    padding: 24,
    alignItems: "center",
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  statValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "700",
  },
  recentWorkoutsContainer: {
    marginTop: 8,
  },
  subsectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  workoutCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  workoutCardBlur: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(22, 27, 34, 0.6)",
  },
  workoutCardContent: {
    padding: 16,
  },
  workoutInfo: {
    gap: 4,
  },
  workoutName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  workoutDate: {
    color: "#9ca3af",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
});

export default FriendDetails;

