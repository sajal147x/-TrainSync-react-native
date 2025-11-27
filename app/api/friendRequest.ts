import client from "./client";

export interface UserSearchResponseDto {
  userId: string;
  name: string;
  age: number;
  email: string;
  profilePictureUrl: string;
  requestStatus: "NONE" | "PENDING" | "ACCEPTED";
}

export interface UserSearchDto {
  userName: string;
}

export async function searchUser(userName: string): Promise<UserSearchResponseDto | "User Not Found"> {
  const requestBody: UserSearchDto = {
    userName,
  };
  
  const response = await client.post("/friend-requests/search", requestBody);
  
  // Check if the response is the string "User Not Found"
  if (typeof response.data === "string" && response.data === "User Not Found") {
    return "User Not Found";
  }
  
  // Otherwise, return the user data
  return response.data as UserSearchResponseDto;
}

export interface SendFriendRequestDto {
  userId: string;
}

export async function sendFriendRequest(userId: string): Promise<void> {
  const requestBody: SendFriendRequestDto = {
    userId,
  };
  
  await client.post("/friend-requests/send-request", requestBody);
}

