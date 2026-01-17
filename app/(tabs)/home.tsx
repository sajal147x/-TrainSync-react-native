import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser, UserDetails } from "../api/user";
import { getLoggedWorkouts, getMonthlyExerciseCountPerMuscle, MonthlyExerciseCountPerMuscleDto, getMostPerformedExercises, ExerciseCountDto } from "../api/stats/homeStats";

const Home: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [workoutsLogged, setWorkoutsLogged] = useState<number>(0);
  const [muscleGroupStats, setMuscleGroupStats] = useState<MonthlyExerciseCountPerMuscleDto[]>([]);
  const [mostPerformedExercises, setMostPerformedExercises] = useState<ExerciseCountDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, workoutsCount, muscleStats, exercisesData] = await Promise.all([
          getCurrentUser(),
          getLoggedWorkouts(),
          getMonthlyExerciseCountPerMuscle(),
          getMostPerformedExercises()
        ]);
        setUser(userData);
        setWorkoutsLogged(workoutsCount);
        setMuscleGroupStats(muscleStats);
        setMostPerformedExercises(exercisesData);
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
              # of Exercises (Last 7 Days)
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
          <View style={{ backgroundColor: "#161b22", padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <Text style={{ color: "#8b949e", fontSize: 14, marginBottom: 16 }}>
              Most Performed Exercises
            </Text>
            {mostPerformedExercises.length === 0 ? (
              <Text style={{ color: "#8b949e", fontSize: 14 }}>
                No data available
              </Text>
            ) : (
              <View>
                {mostPerformedExercises.map((exercise, index) => (
                  <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: index < mostPerformedExercises.length - 1 ? 16 : 0 }}>
                    {exercise.exercisePictureUrl ? (
                      <Image
                        source={{ uri: exercise.exercisePictureUrl }}
                        style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: "#0d1117", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#8b949e", fontSize: 20 }}>?</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                        {exercise.exerciseName}{" "}
                        <Text style={{ color: "#1f6feb", fontSize: 14, fontWeight: "bold" }}>
                          {exercise.exerciseCount}x
                        </Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        router.push({
                          pathname: "/stats/exerciseStats" as any,
                          params: {
                            exerciseLibraryId: exercise.exerciseLibraryId,
                            exerciseName: exercise.exerciseName,
                            exercisePictureUrl: exercise.exercisePictureUrl || "",
                          },
                        });
                      }}
                      style={{
                        marginLeft: 12,
                        padding: 8,
                        borderRadius: 8,
                        backgroundColor: "#0d1117",
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="stats-chart" size={20} color="#1f6feb" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Home; // ✅ default export
