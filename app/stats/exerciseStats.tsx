import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getExerciseStats, ExerciseStatsDto } from "../api/stats/exerciseStats";

const ExerciseStats: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseLibraryId = params.exerciseLibraryId as string;
  const exerciseName = (params.exerciseName as string) || "";
  const exercisePictureUrl = (params.exercisePictureUrl as string) || "";

  const [stats, setStats] = useState<ExerciseStatsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!exerciseLibraryId) {
        setError("Exercise Library ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getExerciseStats(exerciseLibraryId);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching exercise stats:", err);
        setError("Failed to load exercise stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [exerciseLibraryId]);

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

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#ff4444", fontSize: 16 }}>{error}</Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
            {/* Exercise Image */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              {exercisePictureUrl ? (
                <Image
                  source={{ uri: exercisePictureUrl }}
                  style={{ width: 200, height: 200, borderRadius: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: 200, height: 200, borderRadius: 12, backgroundColor: "#161b22", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="image-outline" size={64} color="#8b949e" />
                </View>
              )}
            </View>

            {/* Exercise Name */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
                {exerciseName || "Exercise"}
              </Text>
            </View>

            {stats && (
              <>
                {/* Stats Cards */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 }}>
                  {/* Total Count */}
                  <View style={{ width: "48%", backgroundColor: "#161b22", padding: 20, borderRadius: 12, marginBottom: 16 }}>
                    <Text style={{ color: "#8b949e", fontSize: 14, marginBottom: 8 }}># Times Performed</Text>
                    <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
                      {stats.totalCount}
                    </Text>
                  </View>

                  {/* Average Sets */}
                  <View style={{ width: "48%", backgroundColor: "#161b22", padding: 20, borderRadius: 12, marginBottom: 16 }}>
                    <Text style={{ color: "#8b949e", fontSize: 14, marginBottom: 8 }}>Avg Sets</Text>
                    <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
                      {stats.averageNumberOfSets}
                    </Text>
                  </View>
                </View>

                {/* Max Weight Card */}
                <View style={{ backgroundColor: "#161b22", padding: 20, borderRadius: 12, marginBottom: 24 }}>
                  <Text style={{ color: "#8b949e", fontSize: 14, marginBottom: 8 }}>Max Weight</Text>
                  <Text style={{ color: "#fff", fontSize: 36, fontWeight: "bold" }}>
                    {stats.maxWeight} lbs X {stats.repsForMaxWeight} {stats.repsForMaxWeight === 1 ? "rep" : "reps"}
                  </Text>
                </View>

                {/* Recommended Sets */}
                {stats.recommendedSets && stats.recommendedSets.length > 0 && (
                  <View style={{ backgroundColor: "#161b22", padding: 20, borderRadius: 12 }}>
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
                      Recommended Sets
                    </Text>
                    {stats.recommendedSets.map((set, index) => (
                      <View
                        key={set.id || index}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          borderBottomWidth: index < stats.recommendedSets.length - 1 ? 1 : 0,
                          borderBottomColor: "#0d1117",
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: "#1f6feb",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
                          >
                            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
                              {set.setNumber}
                            </Text>
                          </View>
                          <View>
                            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                              {set.weight} lbs
                            </Text>
                            <Text style={{ color: "#8b949e", fontSize: 14 }}>
                              {set.reps} {set.reps === 1 ? "rep" : "reps"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ExerciseStats;

