import React from "react";
import { View, Text } from "react-native";

const settings: React.FC = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0d1117" }}>
      <Text style={{ color: "#fff", fontSize: 20 }}>Settings</Text>
    </View>
  );
};

export default settings; // ✅ default export
