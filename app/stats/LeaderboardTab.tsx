import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { getExerciseLeaderboard, ExerciseLeaderBoardDto } from "../api/stats/exerciseStats";

interface LeaderboardTabProps {
  exerciseLibraryId: string;
  statType: string;
}

const STAT_TYPE_MAX_WEIGHT = "max_weight";
const STAT_TYPE_TOTAL_VOLUME = "total_volume";

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  exerciseLibraryId,
  statType: initialStatType,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<ExerciseLeaderBoardDto[]>([]);
  const [selectedStatType, setSelectedStatType] = useState<string>(initialStatType || STAT_TYPE_TOTAL_VOLUME);

  const statTypes = [
    { label: "Max Weight", value: STAT_TYPE_MAX_WEIGHT },
    { label: "Volume", value: STAT_TYPE_TOTAL_VOLUME },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!exerciseLibraryId || !selectedStatType) {
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getExerciseLeaderboard(selectedStatType, exerciseLibraryId);
        setLeaderboard(data);
      } catch (err) {
        console.error("Error fetching exercise leaderboard:", err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [exerciseLibraryId, selectedStatType]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No leaderboard data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Stat Type Buttons */}
      <View style={styles.statTypeContainer}>
        <Text style={styles.statTypeLabel}>Stat Type</Text>
        <View style={styles.statTypeButtons}>
          {statTypes.map((statType) => (
            <TouchableOpacity
              key={statType.value}
              onPress={() => setSelectedStatType(statType.value)}
              style={[
                styles.statTypeButton,
                selectedStatType === statType.value && styles.statTypeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.statTypeButtonText,
                  selectedStatType === statType.value && styles.statTypeButtonTextActive,
                ]}
              >
                {statType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Leaderboard List */}
      {leaderboard.map((entry, index) => (
        <View key={entry.userId ? `${entry.userId}-${index}` : `leaderboard-${index}`} style={styles.leaderboardItem}>
          {entry.profilePictureUrl ? (
            <Image
              source={{ uri: entry.profilePictureUrl }}
              style={styles.profilePicture}
              contentFit="cover"
              cachePolicy="disk"
            />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Text style={styles.profilePictureText}>
                {entry.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <View style={styles.memberInfo}>
            <Text style={styles.rankNumber}>{index + 1}. </Text>
            <Text style={styles.memberName}>{entry.name}</Text>
          </View>
          <Text style={styles.statValue}>
            {entry.statValue}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
  emptyText: {
    color: "#8b949e",
    fontSize: 16,
  },
  statTypeContainer: {
    marginBottom: 20,
  },
  statTypeLabel: {
    color: "#8b949e",
    fontSize: 14,
    marginBottom: 12,
  },
  statTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  statTypeButtonActive: {
    backgroundColor: "#1f6feb",
    borderColor: "#1f6feb",
  },
  statTypeButtonText: {
    color: "#8b949e",
    fontSize: 14,
    fontWeight: "400",
  },
  statTypeButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  rankNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.4)",
    marginRight: 12,
  },
  profilePicturePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profilePictureText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  memberName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statValue: {
    color: "#1f6feb",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LeaderboardTab;
