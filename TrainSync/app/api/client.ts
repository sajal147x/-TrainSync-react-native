import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Use your computer's IP if running on Expo mobile
const API_BASE = "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Interceptor to add JWT automatically
client.interceptors.request.use(async (config) => {
  try {
    const stored = await SecureStore.getItemAsync("jwt");
    if (stored) {
        config.headers.Authorization = `Bearer ${stored}`;
    }
  } catch (err) {
    console.warn("Could not attach JWT to request:", err);
  }
  return config;
});

export default client;
