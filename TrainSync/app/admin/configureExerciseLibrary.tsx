import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { getEquipmentTags, EquipmentTagDto } from "../api/exercises";

export default function ConfigureExerciseLibrary() {
  const router = useRouter();
  const [exerciseName, setExerciseName] = useState("");
  const [equipmentTags, setEquipmentTags] = useState<EquipmentTagDto[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(
    new Set()
  );
  const [isEquipmentDropdownOpen, setIsEquipmentDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEquipmentTags = async () => {
      setIsLoading(true);
      try {
        const tags = await getEquipmentTags();
        setEquipmentTags(tags);
      } catch (error) {
        console.error("Failed to fetch equipment tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipmentTags();
  }, []);

  const toggleEquipment = (equipmentId: string) => {
    const newSelected = new Set(selectedEquipment);
    if (newSelected.has(equipmentId)) {
      newSelected.delete(equipmentId);
    } else {
      newSelected.add(equipmentId);
    }
    setSelectedEquipment(newSelected);
  };

  const getSelectedEquipmentNames = () => {
    return equipmentTags
      .filter((tag) => selectedEquipment.has(tag.id))
      .map((tag) => tag.name)
      .join(", ");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.title}>Configure Exercise Library</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Exercise Name</Text>
          <TextInput
            style={styles.input}
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholder="Enter exercise name"
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Equipment</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsEquipmentDropdownOpen(!isEquipmentDropdownOpen)}
          >
            <Text
              style={[
                styles.dropdownButtonText,
                selectedEquipment.size === 0 && styles.placeholderText,
              ]}
            >
              {selectedEquipment.size > 0
                ? getSelectedEquipmentNames() || "Select equipment"
                : "Select equipment"}
            </Text>
            <Ionicons
              name={isEquipmentDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>

          {isEquipmentDropdownOpen && (
            <View style={styles.dropdownContainer}>
              {isLoading ? (
                <Text style={styles.loadingText}>Loading equipment...</Text>
              ) : equipmentTags.length === 0 ? (
                <Text style={styles.emptyText}>No equipment available</Text>
              ) : (
                equipmentTags.map((equipment) => (
                  <TouchableOpacity
                    key={equipment.id}
                    style={styles.checkboxItem}
                    onPress={() => toggleEquipment(equipment.id)}
                  >
                    <View style={styles.checkbox}>
                      {selectedEquipment.has(equipment.id) && (
                        <Ionicons name="checkmark" size={16} color="#3b82f6" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{equipment.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#cbd5e1",
    marginBottom: 8,
    fontWeight: "700",
  },
  input: {
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#f1f5f9",
  },
  placeholderText: {
    color: "#64748b",
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    maxHeight: 300,
    padding: 8,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#f1f5f9",
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    padding: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    padding: 12,
    textAlign: "center",
  },
});

