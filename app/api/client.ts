import axios from "axios";
import { router } from "expo-router";
import storage from "./storage";

// Use environment variable for API URL, fallback to local IP for development
// Set EXPO_PUBLIC_API_URL in .env file for production
// For development, use your computer's IP: run `ifconfig | grep "inet " | grep -v 127.0.0.1` on Mac/Linux
// or `ipconfig` on Windows and look for IPv4 Address
const API_BASE = 
  process.env.EXPO_PUBLIC_API_URL

const client = axios.create({
  baseURL: API_BASE,
});

// Interceptor to add JWT and set Content-Type appropriately
client.interceptors.request.use(async (config) => {
  try {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    // Don't attach JWT token for auth endpoints (signin/signup)
    const isAuthEndpoint = config.url?.includes("/auth/signin") || config.url?.includes("/auth/signup");
    
    if (!isAuthEndpoint) {
      const stored = await storage.getItemAsync("jwt");
      if (stored) {
        config.headers.Authorization = `Bearer ${stored}`;
      }
    }
    
    // Check if data is FormData - handle it specially
    // In React Native, FormData must be detected correctly
    const isFormData = config.data instanceof FormData || 
                      (config.data && typeof config.data === "object" && 
                       config.data.constructor && 
                       config.data.constructor.name === "FormData");
    
    if (isFormData) {
      // For FormData, we MUST NOT set Content-Type header
      // React Native's fetch will automatically set: multipart/form-data; boundary=...
      // Any manually set Content-Type will cause issues
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
      
      // Prevent axios from transforming FormData
      if (!config.transformRequest) {
        config.transformRequest = [(data) => data];
      }
    } else if (config.data && typeof config.data === "object") {
      // For JSON requests, set Content-Type
      if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }
  } catch (err) {
    console.warn("Could not attach JWT to request:", err);
  }
  return config;
});

// Response interceptor to handle API failures and logout user
client.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  async (error) => {
    // Don't logout for signin/signup endpoints (they naturally can fail)
    const isAuthEndpoint = 
      error.config?.url?.includes("/auth/signin") || 
      error.config?.url?.includes("/auth/signup");
    
    if (!isAuthEndpoint) {
      // Check for any API failure:
      // 1. Network errors (can't reach server)
      // 2. 401 Unauthorized (invalid/expired token)
      // 3. Any other error response from server
      const shouldLogout = 
        error.code === "ERR_NETWORK" || // Network error
        !error.response ||               // No response from server
        error.response?.status === 401;  // Unauthorized
      
      if (shouldLogout) {
        console.log("API failure detected - logging out user");
        
        // Clear the stored JWT token
        try {
          await storage.deleteItemAsync("jwt");
        } catch (storageError) {
          console.error("Error clearing JWT:", storageError);
        }
        
        // Redirect to signin page
        router.replace("/(auth)/signin");
        
        // Don't re-throw the error to prevent it from showing on screen
        return Promise.resolve({ data: null, status: 0, statusText: "Logged out" });
      }
    }
    
    // Re-throw the error so it can be handled by the calling code if needed
    return Promise.reject(error);
  }
);

export default client;
