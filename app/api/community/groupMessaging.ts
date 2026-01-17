import client from "../client";
import { FriendsResponseDto } from "./community";

export interface GroupMessageDto {
  sentAt: string;
  message: string;
  isSentByLoggedInUser: string;
  userDto: FriendsResponseDto;
}

export async function getGroupMessages(groupId: string): Promise<GroupMessageDto[]> {
  const response = await client.post<GroupMessageDto[]>(
    `/get-group-messages`,
    { groupId }
  );
  return response.data;
}

