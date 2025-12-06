import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
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
    
    // Don't attach JWT token for auth endpoints (signin/signup/refresh)
    const isAuthEndpoint = 
      config.url?.includes("/auth/signin") || 
      config.url?.includes("/auth/signup") ||
      config.url?.includes("/auth/refresh");
    
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

// Response interceptor to handle API failures, token refresh, and logout user
client.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _tokenRefreshed?: boolean; 
      _retryCount?: number;
    };
    
    // Don't handle auth endpoints (signin/signup/refresh) - they naturally can fail
    const isAuthEndpoint = 
      originalRequest?.url?.includes("/auth/signin") || 
      originalRequest?.url?.includes("/auth/signup") ||
      originalRequest?.url?.includes("/auth/refresh");
    
    if (!isAuthEndpoint && originalRequest) {
      // Try token refresh for any non-200 response (only once)
      const statusCode = error.response?.status;
      const isNot200 = statusCode !== undefined && statusCode !== 200;
      
      if (isNot200 && !originalRequest._tokenRefreshed) {
        originalRequest._tokenRefreshed = true; // Mark that we've attempted token refresh
        
        try {
          // Get refresh token from storage
          const storedRefreshToken = await storage.getItemAsync("refreshToken");
          
          if (!storedRefreshToken) {
            throw new Error("No refresh token available");
          }
          
          // Attempt to refresh the access token using a direct axios call to avoid circular dependency
          const refreshResponse = await axios.post(
            `${API_BASE}/auth/refresh`,
            { refreshToken: storedRefreshToken },
            {
              validateStatus: (status) => status < 500, // Don't throw for 4xx errors
            }
          );
          
          // Check if refresh was successful
          if (refreshResponse.status === 200 && refreshResponse.data?.accessToken) {
            // Update stored tokens
            await storage.setItemAsync("jwt", refreshResponse.data.accessToken);
            if (refreshResponse.data.refreshToken) {
              await storage.setItemAsync("refreshToken", refreshResponse.data.refreshToken);
            }
            
            // Update the original request with the new access token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            }
            
            // Retry the original request with the new token
            return client(originalRequest);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          // Refresh failed - if it was a 401, logout user; otherwise continue with original error
          if (error.response?.status === 401) {
            console.log("Token refresh failed - logging out user");
            
            // Clear stored tokens
            try {
              await storage.deleteItemAsync("jwt");
              await storage.deleteItemAsync("refreshToken");
            } catch (storageError) {
              console.error("Error clearing tokens:", storageError);
            }
            
            // Redirect to signin page
            router.replace("/(auth)/signin");
            
            // Don't re-throw the error to prevent it from showing on screen
            return Promise.resolve({ data: null, status: 0, statusText: "Logged out" });
          }
          // For other errors, continue to re-throw the original error
        }
      }
      
      // Handle logout for network errors
      if (error.code === "ERR_NETWORK" || !error.response) {
        console.log("API failure detected - logging out user");
        
        // Clear the stored tokens
        try {
          await storage.deleteItemAsync("jwt");
          await storage.deleteItemAsync("refreshToken");
        } catch (storageError) {
          console.error("Error clearing tokens:", storageError);
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
