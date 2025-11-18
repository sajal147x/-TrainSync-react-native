import client from "./client";

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  age: number | null;
  profilePictureUrl?: string | null;
  userType: string;
}

export interface UserUpdateRequest {
  id: string;
  name: string;
  email: string;
  age: number | null;
  profilePictureBase64?: string | null; // Base64 encoded image
}

export async function getCurrentUser(): Promise<UserDetails> {
  const response = await client.get("/user/me"); // backend endpoint
  return response.data;
}

// Update user - uses base64 encoding for image (easiest approach)
export async function updateUser(
  request: UserDetails,
  profilePictureBase64?: string | null
): Promise<UserDetails> {
  // Build the update request
  const updateRequest: UserUpdateRequest = {
    id: request.id,
    name: request.name,
    email: request.email,
    age: request.age,
    profilePictureBase64: profilePictureBase64 || null,
  };

  // Send as JSON using axios client (no multipart issues!)
  const response = await client.put("/user/updateUser", updateRequest);
  return response.data;
}