import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUser, UserDetails } from "../api/user";

export default function Settings() {
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        {user ? (
          <>
            <Text style={styles.label}>Name: {user.name}</Text>
            <Text style={styles.label}>Email: {user.email}</Text>
          </>
        ) : (
          <Text style={styles.label}>Not logged in</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24, // extra spacing so title isn’t cut off
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#cbd5e1",
    marginBottom: 12,
  },
});
