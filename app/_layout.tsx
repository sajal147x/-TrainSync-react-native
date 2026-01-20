// app/_layout.tsx
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle notification responses (when user taps on a notification)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        // Check if this is a GROUP notification
        if (data?.type === "GROUP") {
          const groupId = data.groupId;
          const groupName = typeof data.groupName === "string" ? data.groupName : String(data.groupName || "");
          const profilePictureUrl = typeof data.profilePictureUrl === "string" ? data.profilePictureUrl : String(data.profilePictureUrl || "");
          
          if (groupId) {
            // Route to the Group Messaging tab with the group data
            router.push({
              pathname: "/community/Group/messaging" as any,
              params: {
                groupId: groupId.toString(),
                groupName: groupName,
                profilePictureUrl: profilePictureUrl,
              },
            });
          }
        }
      }
    );

    // Also check if app was opened from a notification (when app was closed)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        
        if (data?.type === "GROUP") {
          const groupId = data.groupId;
          const groupName = typeof data.groupName === "string" ? data.groupName : String(data.groupName || "");
          const profilePictureUrl = typeof data.profilePictureUrl === "string" ? data.profilePictureUrl : String(data.profilePictureUrl || "");
          
          if (groupId) {
            // Small delay to ensure navigation is ready
            setTimeout(() => {
              router.push({
                pathname: "/community/Group/messaging" as any,
                params: {
                  groupId: groupId.toString(),
                  groupName: groupName,
                  profilePictureUrl: profilePictureUrl,
                },
              });
            }, 500);
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false, // hide headers globally if you want
        contentStyle: { backgroundColor: "#0d1117" },
      }}
    />
  );
}
