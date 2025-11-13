import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";

const NewWorkout: React.FC = () => {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker is a dialog that closes automatically
    // On iOS, keep the picker open while scrolling through dates
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setWorkoutDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <Text style={styles.title}>New Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Workout Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Workout Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter workout name"
            placeholderTextColor="#6b7280"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>

        {/* Date Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Date</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
            <Text style={styles.dateText}>{formatDate(workoutDate)}</Text>
            <Ionicons 
              name={showDatePicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#9ca3af" 
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={workoutDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            textColor="#ffffff"
            themeVariant="dark"
          />
        )}

        <TouchableOpacity
          style={styles.addExerciseButton}
          activeOpacity={0.8}
          onPress={() => router.push("/workout/exercise-selection")}
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  datePickerButton: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginLeft: 12,
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
});

export default NewWorkout;

