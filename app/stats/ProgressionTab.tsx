import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { getExerciseStatsWithFilters, ExerciseStatsDto } from "../api/stats/exerciseStats";

interface ProgressionTabProps {
  exerciseLibraryId: string;
  exerciseName: string;
  exercisePictureUrl: string;
}

const STAT_TYPE_MAX_WEIGHT = "max_weight";
const STAT_TYPE_TOTAL_VOLUME = "total_volume";

const ProgressionTab: React.FC<ProgressionTabProps> = ({
  exerciseLibraryId,
  exerciseName,
  exercisePictureUrl,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ExerciseStatsDto | null>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>("1");
  const [selectedStatType, setSelectedStatType] = useState<string>(STAT_TYPE_TOTAL_VOLUME);

  const timeFrames = [
    { label: "1 Month", value: "1" },
    { label: "3 Months", value: "3" },
    { label: "6 Months", value: "6" },
    { label: "1 Year", value: "12" },
  ];

  const statTypes = [
    { label: "Max Weight", value: STAT_TYPE_MAX_WEIGHT },
    { label: "Volume", value: STAT_TYPE_TOTAL_VOLUME },
  ];

  const fetchStats = async () => {
    if (!exerciseLibraryId) {
      setError("Exercise Library ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getExerciseStatsWithFilters(
        exerciseLibraryId,
        selectedTimeFrame,
        selectedStatType
      );
      setStats(data);
    } catch (err) {
      console.error("Error fetching exercise stats:", err);
      setError("Failed to load exercise stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [exerciseLibraryId, selectedTimeFrame, selectedStatType]);

  const screenWidth = Dimensions.get("window").width;

  const chartData = stats?.exerciseStatTimeFrames
    ? (() => {
        // Sort by workoutDate to ensure chronological order
        const sortedData = [...stats.exerciseStatTimeFrames].sort((a, b) => {
          return new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime();
        });

        return {
          labels: sortedData.map(() => ""), // Empty labels - dates not displayed
          datasets: [
            {
              data: sortedData.map((item) => item.statValue || 0),
              color: (opacity = 1) => `rgba(31, 111, 235, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        };
      })()
    : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
      {/* Exercise Image */}
      <View style={{ alignItems: "center", marginTop: 16, marginBottom: 16 }}>
        {exercisePictureUrl ? (
          <Image
            source={{ uri: exercisePictureUrl }}
            style={{ width: 120, height: 120, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: "#161b22", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="image-outline" size={48} color="#8b949e" />
          </View>
        )}
      </View>

      {/* Exercise Name */}
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
          {exerciseName || "Exercise"}
        </Text>
      </View>

      {/* Time Frame Buttons */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: "#8b949e", fontSize: 14, marginBottom: 12 }}>Time Frame</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {timeFrames.map((timeFrame) => (
            <TouchableOpacity
              key={timeFrame.value}
              onPress={() => setSelectedTimeFrame(timeFrame.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: selectedTimeFrame === timeFrame.value ? "#1f6feb" : "#161b22",
                borderWidth: 1,
                borderColor: selectedTimeFrame === timeFrame.value ? "#1f6feb" : "#30363d",
              }}
            >
              <Text
                style={{
                  color: selectedTimeFrame === timeFrame.value ? "#fff" : "#8b949e",
                  fontSize: 14,
                  fontWeight: selectedTimeFrame === timeFrame.value ? "600" : "400",
                }}
              >
                {timeFrame.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Graph */}
      {loading ? (
        <View style={{ height: 300, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={{ height: 300, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Text style={{ color: "#ff4444", fontSize: 16 }}>{error}</Text>
        </View>
      ) : chartData && stats?.exerciseStatTimeFrames && stats.exerciseStatTimeFrames.length > 0 ? (
        <View
          style={{
            backgroundColor: "#161b22",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <LineChart
            data={chartData}
            width={screenWidth - 72}
            height={280}
            chartConfig={{
              backgroundColor: "#161b22",
              backgroundGradientFrom: "#161b22",
              backgroundGradientTo: "#161b22",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(31, 111, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#1f6feb",
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: "#30363d",
                strokeWidth: 1,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
          />
        </View>
      ) : (
        <View style={{ height: 300, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Text style={{ color: "#8b949e", fontSize: 14 }}>No data available</Text>
        </View>
      )}

      {/* Stat Type Buttons */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: "#8b949e", fontSize: 14, marginBottom: 12 }}>Stat Type</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {statTypes.map((statType) => (
            <TouchableOpacity
              key={statType.value}
              onPress={() => setSelectedStatType(statType.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: selectedStatType === statType.value ? "#1f6feb" : "#161b22",
                borderWidth: 1,
                borderColor: selectedStatType === statType.value ? "#1f6feb" : "#30363d",
              }}
            >
              <Text
                style={{
                  color: selectedStatType === statType.value ? "#fff" : "#8b949e",
                  fontSize: 14,
                  fontWeight: selectedStatType === statType.value ? "600" : "400",
                }}
              >
                {statType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProgressionTab;
