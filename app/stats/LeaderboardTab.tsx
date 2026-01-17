import React from "react";
import { View, Text } from "react-native";
import { ExerciseStatsDto } from "../api/stats/exerciseStats";

interface LeaderboardTabProps {
  loading: boolean;
  error: string | null;
  stats: ExerciseStatsDto | null;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  loading,
  error,
  stats,
}) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
      <Text style={{ color: "#8b949e", fontSize: 16 }}>Leaderboard coming soon</Text>
    </View>
  );
};

export default LeaderboardTab;
