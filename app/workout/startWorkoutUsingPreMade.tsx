import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getPreMadeWorkouts, PreMadeWorkoutListItem } from "../api/PreMadeWorkout";
import PreMadeWorkoutDetailsModal from "../components/PreMadeWorkoutDetailsModal";

const StartWorkoutUsingPreMade: React.FC = () => {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<PreMadeWorkoutListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPreMadeWorkouts();
        setWorkouts(data);
      } catch (err: any) {
        console.error("Error fetching pre-made workouts:", err);
        setError(err.response?.data?.message || "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const handleWorkoutSelect = (preMadeWorkoutId: string) => {
    setSelectedWorkoutId(preMadeWorkoutId);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedWorkoutId(null);
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
        <Text style={styles.headerTitle}>Select Pre-Made Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading workouts...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
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
                style={styles.workoutCard}
                onPress={() => handleWorkoutSelect(item.id)}
                activeOpacity={0.8}
              >
                <BlurView intensity={60} tint="dark" style={styles.cardBlur}>
                  <View style={styles.cardContent}>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{item.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
                  </View>
                </BlurView>
              </TouchableOpacity>
            )}
            style={styles.workoutList}
            contentContainerStyle={styles.workoutListContent}
          />
        )}
      </View>

      <PreMadeWorkoutDetailsModal
        visible={isModalVisible}
        preMadeWorkoutId={selectedWorkoutId}
        onClose={handleCloseModal}
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
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default StartWorkoutUsingPreMade;

