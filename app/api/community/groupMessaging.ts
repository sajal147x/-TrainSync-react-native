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

export interface GroupMessageRequest {
  groupId: string;
  message: string;
}

export async function sendGroupMessage(request: GroupMessageRequest): Promise<void> {
  await client.post(
    `/send-message`,
    { groupId: request.groupId, message: request.message }
  );
}
