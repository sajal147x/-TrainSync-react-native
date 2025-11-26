// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // hide headers globally if you want
        contentStyle: { backgroundColor: "#0d1117" },
      }}
    />
  );
}
