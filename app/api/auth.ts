import client from "./client";

export const signUp = (username: string, password: string, name: string, age: number) =>
  client.post("/auth/signup", { username, password, name, age }, {
    validateStatus: (status) => status < 500, // Don't throw for 4xx errors, handle them manually
  });

export const signIn = (username: string, password: string) =>
  client.post("/auth/signin", { username, password }, {
    validateStatus: (status) => status < 500, // Don't throw for 4xx errors, handle them manually
  });
