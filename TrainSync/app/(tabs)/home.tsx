import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getCurrentUser, UserDetails } from "../api/user";
import { getLoggedWorkouts, getExerciseProgression, ExerciseProgressionDto } from "../api/homeStats";

const STATIC_EXERCISE_ID = "a1363c95-b399-4907-9015-3ab6681113de";
const screenWidth = Dimensions.get("window").width;

// Helper function to extract date from string (handles various date formats)
const extractDate = (dateString: string): string => {
  // If it's already just a date (YYYY-MM-DD), return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // If it contains a date, extract it (handles ISO strings, etc.)
  const dateMatch = dateString.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }
  // Try to parse and format
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return dateString; // Fallback to original string
};

// Helper function to format date for display (e.g., "Jan 15" or "01/15")
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

const Home: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [workoutsLogged, setWorkoutsLogged] = useState<number>(0);
  const [exerciseProgression, setExerciseProgression] = useState<ExerciseProgressionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Process chart data
  const chartData = useMemo(() => {
    if (exerciseProgression.length === 0) {
      return null;
    }

    // Sort by date to ensure chronological order
    const sorted = [...exerciseProgression].sort((a, b) => {
      const dateA = new Date(extractDate(a.date)).getTime();
      const dateB = new Date(extractDate(b.date)).getTime();
      return dateA - dateB;
    });

    const labels = sorted.map(item => formatDateForDisplay(extractDate(item.date)));
    const tonnageData = sorted.map(item => item.tonnage);

    // If there are too many labels, show only some to avoid overcrowding
    // Use empty strings for labels we want to hide
    const displayLabels = labels.length > 10 
      ? labels.map((label, i) => {
          const step = Math.ceil(labels.length / 8); // Show ~8 labels max
          return (i % step === 0 || i === labels.length - 1) ? label : "";
        })
      : labels;

    return {
      labels: displayLabels,
      datasets: [
        {
          data: tonnageData,
          color: (opacity = 1) => `rgba(88, 166, 255, ${opacity})`, // #58a6ff with opacity
          strokeWidth: 2,
        },
      ],
    };
  }, [exerciseProgression]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, workoutsCount, progression] = await Promise.all([
          getCurrentUser(),
          getLoggedWorkouts(),
          getExerciseProgression(STATIC_EXERCISE_ID)
        ]);
        setUser(userData);
        setWorkoutsLogged(workoutsCount);
        setExerciseProgression(progression);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0d1117", paddingTop: 60, paddingHorizontal: 20 }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ff4444", fontSize: 16 }}>{error}</Text>
        </View>
      ) : (
        <ScrollView>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
            Welcome, {user?.name || "User"}
          </Text>
          <View style={{ backgroundColor: "#161b22", padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <Text style={{ color: "#8b949e", fontSize: 14, marginBottom: 8 }}>
              Workouts Logged
            </Text>
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "bold" }}>
              {workoutsLogged}
            </Text>
          </View>
          <View style={{ backgroundColor: "#161b22", padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <Text style={{ color: "#8b949e", fontSize: 14, marginBottom: 16 }}>
              Exercise Progression (tonnage x date)
            </Text>
            {chartData ? (
              <LineChart
                data={chartData}
                width={screenWidth - 80} // Account for padding
                height={220}
                chartConfig={{
                  backgroundColor: "#161b22",
                  backgroundGradientFrom: "#161b22",
                  backgroundGradientTo: "#161b22",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(88, 166, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#58a6ff",
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "", // solid lines
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
                withShadow={false}
              />
            ) : (
              <View style={{ height: 220, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#8b949e", fontSize: 14 }}>No progression data available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Home; // ✅ default export
