import axios from "axios";
import client from "../client";

// Simple axios instance for refresh token calls (bypasses interceptors to avoid circular dependency)
const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const refreshClient = axios.create({
  baseURL: API_BASE,
});

export const signUp = (username: string, password: string, name: string, email: string, age: number) =>
  client.post("/auth/signup", { username, password, name, email, age }, {
    validateStatus: (status) => status < 500, // Don't throw for 4xx errors, handle them manually
  });

export const signIn = (username: string, password: string) =>
  client.post("/auth/signin", { username, password }, {
    validateStatus: (status) => status < 500, // Don't throw for 4xx errors, handle them manually
  });

export const refreshToken = (refreshToken: string) =>
  refreshClient.post("/auth/refresh", { refreshToken }, {
    validateStatus: (status) => status < 500, // Don't throw for 4xx errors, handle them manually
  });
