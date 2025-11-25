import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { getCurrentUser, UserDetails } from "../api/user";
import { getLoggedWorkouts, getMonthlyExerciseCountPerMuscle, MonthlyExerciseCountPerMuscleDto } from "../api/homeStats";

const Home: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [workoutsLogged, setWorkoutsLogged] = useState<number>(0);
  const [muscleGroupStats, setMuscleGroupStats] = useState<MonthlyExerciseCountPerMuscleDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, workoutsCount, muscleStats] = await Promise.all([
          getCurrentUser(),
          getLoggedWorkouts(),
          getMonthlyExerciseCountPerMuscle()
        ]);
        setUser(userData);
        setWorkoutsLogged(workoutsCount);
        setMuscleGroupStats(muscleStats);
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
              Muscle Group Stats (Last 7 Days)
            </Text>
            {muscleGroupStats.length === 0 ? (
              <Text style={{ color: "#8b949e", fontSize: 14 }}>
                No data available
              </Text>
            ) : (
              <View>
                {(() => {
                  const maxCount = Math.max(...muscleGroupStats.map(stat => stat.numberOfTimesWorked), 1);
                  return muscleGroupStats.map((stat, index) => {
                    const barWidth = (stat.numberOfTimesWorked / maxCount) * 100;
                    return (
                      <View key={index} style={{ marginBottom: index < muscleGroupStats.length - 1 ? 20 : 0 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", width: 120 }}>
                            {stat.muscleGroup}
                          </Text>
                          <View style={{ flex: 1, height: 24, backgroundColor: "#0d1117", borderRadius: 4, overflow: "hidden" }}>
                            <View
                              style={{
                                height: "100%",
                                width: `${barWidth}%`,
                                backgroundColor: "#1f6feb",
                                borderRadius: 4,
                                justifyContent: "center",
                                alignItems: "flex-end",
                                paddingRight: 8,
                              }}
                            >
                              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                                {stat.numberOfTimesWorked}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  });
                })()}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Home; // ✅ default export
