import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { getCurrentUser, UserDetails } from "../api/user";
import { getLoggedWorkouts } from "../api/homeStats";

const Home: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [workoutsLogged, setWorkoutsLogged] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, workoutsCount] = await Promise.all([
          getCurrentUser(),
          getLoggedWorkouts()
        ]);
        setUser(userData);
        setWorkoutsLogged(workoutsCount);
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
        <>
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
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 20 }}>🏠 Home</Text>
          </View>
        </>
      )}
    </View>
  );
};

export default Home; // ✅ default export
