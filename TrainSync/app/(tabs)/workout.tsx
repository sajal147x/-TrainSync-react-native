import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const Workout: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Workout</Text>
        <Link href="/workout/new" asChild>
          <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8}>
            <BlurView intensity={80} tint="dark" style={styles.blurView}>
              <LinearGradient
                colors={["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientOverlay}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Log/Start new workout</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 40,
  },
  buttonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    minWidth: 200,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  blurView: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientOverlay: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default Workout; // ✅ default export
