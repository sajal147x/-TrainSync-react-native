import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getExercises, ExerciseDto } from "../api/exercises";

const NewWorkout: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddExercise = async () => {
    setModalVisible(true);
    setLoading(true);
    setError(null);

    try {
      const data = await getExercises();
      setExercises(data);
    } catch (err: any) {
      console.error("Error fetching exercises:", err);
      setError(err.response?.data?.message || "Failed to fetch exercises");
    } finally {
      setLoading(false);
    }
  };

  const renderExerciseItem = ({ item }: { item: ExerciseDto }) => (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={styles.tagsContainer}>
        {item.muscleTags.map((tag, index) => {
          // Vary rotation for more natural sticky note effect
          const rotation = index % 3 === 0 ? "-1deg" : index % 3 === 1 ? "1deg" : "0deg";
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>New Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.addExerciseButton}
          activeOpacity={0.8}
          onPress={handleAddExercise}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            <LinearGradient
              colors={[
                "rgba(59, 130, 246, 0.2)",
                "rgba(59, 130, 246, 0.1)",
                "rgba(59, 130, 246, 0.2)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientOverlay}
            >
              <View style={styles.buttonInner}>
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <SafeAreaView edges={["bottom"]} style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Exercise</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

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
                </View>
              )}

              {!loading && !error && (
                <FlatList
                  data={exercises}
                  renderItem={renderExerciseItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.exercisesList}
                  style={styles.exercisesFlatList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </SafeAreaView>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  addExerciseButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  blurView: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientOverlay: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  addExerciseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalOverlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "rgba(13, 17, 23, 0.98)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    width: "100%",
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

export default NewWorkout;

