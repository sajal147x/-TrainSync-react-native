import client from "../client";

export interface RegisterPushTokenRequest {
  pushNotificationToken: string;
  platform: string;
}

/**
 * Register push notification token with the backend
 * @param pushNotificationToken - The Expo push token
 * @param platform - "ios" or "android"
 */
export const registerPushToken = (
  pushNotificationToken: string,
  platform: string
) => {
  const request: RegisterPushTokenRequest = {
    pushNotificationToken,
    platform,
  };

  return client.post("/register-push-token", request, {
    validateStatus: (status) => status < 500, // Don't throw for 4xx errors, handle them manually
  });
};
