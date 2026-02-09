import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { EULA_TITLE, EULA_FULL_TEXT } from "../constants/eula";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>{EULA_TITLE}</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <Text style={styles.body}>{EULA_FULL_TEXT}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginHorizontal: 24,
    marginTop: Platform.OS === "ios" ? 56 : 36,
    marginBottom: 16,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  body: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 22,
  },
});
