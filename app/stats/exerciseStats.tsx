import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ExerciseStats: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  const exerciseName = (params.exerciseName as string) || "";
  const exercisePictureUrl = (params.exercisePictureUrl as string) || "";

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

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
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

          {/* TODO: Add stats content here using exerciseId */}
          {/* The exerciseId ({exerciseId}) will be used for API calls to fetch stats */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ExerciseStats;

