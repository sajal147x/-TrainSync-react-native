import React from "react";
import { View, Text } from "react-native";

const Home: React.FC = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0d1117" }}>
      <Text style={{ color: "#fff", fontSize: 20 }}>🏠 Home</Text>
    </View>
  );
};

export default Home; // ✅ default export
