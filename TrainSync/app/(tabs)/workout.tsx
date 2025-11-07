import React from "react";
import { View, Text } from "react-native";

const Workout: React.FC = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0d1117" }}>
      <Text style={{ color: "#fff", fontSize: 20 }}>Workout</Text>
    </View>
  );
};

export default Workout; // ✅ default export
