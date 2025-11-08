import client from "./client";

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  age: number | null;
}

export async function getCurrentUser(): Promise<UserDetails> {
  const response = await client.get("/user/me"); // backend endpoint
  return response.data;
}

// Update user
export async function updateUser(request: UserDetails): Promise<UserDetails> {
  const response = await client.put("/user/updateUser", request);
  return response.data;
}