import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Cross-platform storage utility
 * - Uses SecureStore on iOS/Android for secure storage
 * - Uses localStorage on web as fallback
 */

const storage = {
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error("Error setting item in localStorage:", error);
        throw error;
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error("Error getting item from localStorage:", error);
        return null;
      }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing item from localStorage:", error);
        throw error;
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export default storage;

