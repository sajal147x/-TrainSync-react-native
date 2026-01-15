import client from "../client";

export interface FriendsResponseDto {
  userId: string;
  name: string;
  profilePictureUrl: string;
}

export async function getFriendsForUser(): Promise<FriendsResponseDto[]> {
  const response = await client.get("/community/friends-for-user");
  return response.data as FriendsResponseDto[];
}

