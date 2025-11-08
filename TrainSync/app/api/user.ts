import client from "./client";

export interface UserDetails {
  id: string;
  name: string;
  email: string;
}

export async function getCurrentUser(): Promise<UserDetails> {
  const response = await client.get("/user/me"); // backend endpoint
  return response.data;
}
