import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getFriendWorkoutSummary, FriendWorkoutSummaryDto } from "../api/community/friendWorkoutSummary";
import { blockUser } from "../api/objectionableContent";

const FriendDetails: React.FC = () => {
  const params = useLocalSearchParams();
  const friendUserId = params.userId as string;
  const friendName = params.name as string;
  const friendProfilePictureUrl = params.profilePictureUrl as string;

  const [summary, setSummary] = useState<FriendWorkoutSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockDialogVisible, setBlockDialogVisible] = useState(false);
  const [blocking, setBlocking] = useState(false);

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

          <TouchableOpacity
            style={styles.blockButton}
            onPress={() => setBlockDialogVisible(true)}
          >
            <Ionicons name="ban" size={18} color="#ef4444" />
            <Text style={styles.blockButtonText}>Block user</Text>
          </TouchableOpacity>
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
                  <ScrollView style={styles.workoutsList} showsVerticalScrollIndicator={false}>
                    {summary.recentWorkouts.map((workout) => (
                      <View key={workout.workoutId} style={styles.workoutItem}>
                        <View style={styles.workoutInfo}>
                          <Text style={styles.workoutName}>{workout.workoutName}</Text>
                          <Text style={styles.workoutDate}>{formatDate(workout.workoutDate)}</Text>
                        </View>
                        <View style={styles.workoutDivider} />
                      </View>
                    ))}
                  </ScrollView>
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

      <Modal
        visible={blockDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBlockDialogVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setBlockDialogVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Block user</Text>
            <Text style={styles.modalMessage}>
              Blocking the user will remove the user from your feed and any group chats with the user will be deleted.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setBlockDialogVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBlockButton}
                onPress={async () => {
                  if (blocking) return;
                  setBlocking(true);
                  try {
                    await blockUser({ userId: friendUserId });
                    setBlockDialogVisible(false);
                    router.replace("/(tabs)/community");
                  } catch (error: any) {
                    console.error("Error blocking user:", error);
                  } finally {
                    setBlocking(false);
                  }
                }}
                disabled={blocking}
              >
                {blocking ? (
                  <ActivityIndicator color="#ef4444" size="small" />
                ) : (
                  <Text style={styles.modalBlockText}>Block</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  blockButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  blockButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalMessage: {
    color: "#9ca3af",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  modalCancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalBlockButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  modalBlockText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
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
  workoutsList: {
    flex: 1,
  },
  workoutItem: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  workoutInfo: {
    alignItems: "flex-start",
  },
  workoutDivider: {
    height: 1,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    marginTop: 8,
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

