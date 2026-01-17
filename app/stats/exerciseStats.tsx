import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ProgressionTab from "./ProgressionTab";
import LeaderboardTab from "./LeaderboardTab";

const ExerciseStats: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseLibraryId = params.exerciseLibraryId as string;
  const exerciseName = (params.exerciseName as string) || "";
  const exercisePictureUrl = (params.exercisePictureUrl as string) || "";

  const [activeTab, setActiveTab] = useState<"Progression" | "Leaderboard">("Progression");


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0d1117" }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
            Exercise Stats
          </Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#161b22" }}>
          <TouchableOpacity
            onPress={() => setActiveTab("Progression")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: activeTab === "Progression" ? 2 : 0,
              borderBottomColor: "#1f6feb",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: activeTab === "Progression" ? "#fff" : "#8b949e",
                fontSize: 16,
                fontWeight: activeTab === "Progression" ? "600" : "400",
              }}
            >
              Progression
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("Leaderboard")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: activeTab === "Leaderboard" ? 2 : 0,
              borderBottomColor: "#1f6feb",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: activeTab === "Leaderboard" ? "#fff" : "#8b949e",
                fontSize: 16,
                fontWeight: activeTab === "Leaderboard" ? "600" : "400",
              }}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "Progression" ? (
          <ProgressionTab
            exerciseLibraryId={exerciseLibraryId}
            exerciseName={exerciseName}
            exercisePictureUrl={exercisePictureUrl}
          />
        ) : (
          <LeaderboardTab
            loading={false}
            error={null}
            stats={null}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ExerciseStats;

