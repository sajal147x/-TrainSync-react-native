import client from "./client";

export const signUp = (email: string, password: string) =>
  client.post("/auth/signup", { email, password });

export const signIn = (email: string, password: string) =>
  client.post("/auth/signin", { email, password });
